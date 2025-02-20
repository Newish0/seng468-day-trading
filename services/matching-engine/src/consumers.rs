use amqprs::{
    channel::{BasicAckArguments, Channel},
    consumer::AsyncConsumer,
    BasicProperties, Deliver,
};
use async_trait::async_trait;
use std::{cmp::Reverse, sync::Arc};
use tokio::sync::RwLock;

use crate::{
    matching_pq::SellOrder,
    models::{
        LimitSellCancelData, LimitSellCancelRequest, LimitSellCancelResponse, LimitSellRequest,
        MarketBuyData, MarketBuyRequest, MarketBuyResponse, OrderUpdate,
    },
    rabbitmq::RabbitMQClient,
    state::AppState,
};

pub struct OrderConsumer {
    state: Arc<RwLock<AppState>>,
    rabbitmq_client: Arc<RabbitMQClient>,
}

struct MarketBuyResult {
    market_buy_response: MarketBuyResponse,
    order_updates: Option<Vec<OrderUpdate>>,
}

impl OrderConsumer {
    pub fn new(state: Arc<RwLock<AppState>>, client: Arc<RabbitMQClient>) -> Self {
        Self {
            state,
            rabbitmq_client: client,
        }
    }

    pub async fn setup(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.rabbitmq_client.setup_consumer(self.clone()).await
    }

    async fn process_market_buy(&self, request: MarketBuyRequest) -> MarketBuyResult {
        // Need to have lock the entire time to ensure no other sell occurs
        // between ensuring we have enough shares and the actual buy/sell process.
        let mut state = self.state.write().await;

        // Total number of shares on sale excluding those from the user requesting the buy order
        let available_shares: u32 = state
            .matching_pq
            .get_all_orders(&request.stock_id)
            .iter()
            .filter(|sell_order| sell_order.user_name != request.user_name)
            .map(|sell_order| sell_order.cur_quantity)
            .sum();

        // Check available shares
        let mut shares_to_buy = request.quantity;
        if shares_to_buy > available_shares {
            return MarketBuyResult {
                market_buy_response: MarketBuyResponse {
                    success: false,
                    data: None,
                },
                order_updates: None,
            };
        }

        // Dry-run: Clone the priority queue to calculate total cost without modifying state
        // OPTIMIZE: This implementation is wildly inefficient but future problem it is!
        // REFACTOR: Too much duplicate code between the dry run and the actual run.
        let Some(original_queue) = state
            .matching_pq
            .get_stock_queue(&request.stock_id)
            .cloned()
        else {
            return MarketBuyResult {
                market_buy_response: MarketBuyResponse {
                    success: false,
                    data: None,
                },
                order_updates: None,
            };
        };

        let mut cloned_queue = original_queue;
        let mut total_price_dry = 0.0;
        let mut remaining_dry = shares_to_buy;

        while remaining_dry > 0 {
            if let Some(Reverse(order)) = cloned_queue.peek() {
                if order.user_name == request.user_name {
                    cloned_queue.pop();
                    continue;
                }

                let take = remaining_dry.min(order.cur_quantity);
                total_price_dry += take as f64 * order.price;
                remaining_dry -= take;
                cloned_queue.pop();
            } else {
                break;
            }
        }

        // Budget validation
        if total_price_dry > request.budget {
            return MarketBuyResult {
                market_buy_response: MarketBuyResponse {
                    success: false,
                    data: None,
                },
                order_updates: None,
            };
        }

        // Proceed with actual purchase processing
        let mut total_price = 0.0;
        let mut shares_bought = 0;
        let mut order_updates: Vec<OrderUpdate> = Vec::new();
        while shares_to_buy > 0 {
            // Assume the sell order always exist due to the above shares quantity check.
            // If it somehow fails, we will break out early. But it is a critical issue at this point.
            let Some(mut top_sell_order) = state.matching_pq.pop(&request.stock_id) else {
                eprintln!("Performing actual buy when there isn't enough valid shares to buy; should not get here.");
                break;
            };

            // Skip if the sell order is from the user requesting the buy order
            if top_sell_order.user_name == request.user_name {
                continue;
            }

            let purchase_all = shares_to_buy >= top_sell_order.cur_quantity;

            // Complete the top sell order or perform partial sell on the top sell order
            if purchase_all {
                total_price += top_sell_order.cur_quantity as f64 * top_sell_order.price;
                shares_bought += top_sell_order.cur_quantity;
                shares_to_buy -= top_sell_order.cur_quantity;

                let sold_qty = top_sell_order.cur_quantity;
                top_sell_order.cur_quantity = 0;

                order_updates.push(OrderUpdate {
                    stock_id: top_sell_order.stock_id.clone(),
                    price: top_sell_order.price,
                    remaining_quantity: top_sell_order.cur_quantity,
                    sold_quantity: sold_qty,
                    stock_tx_id: top_sell_order.stock_tx_id.clone(),
                    user_name: top_sell_order.user_name.clone(),
                });
            } else {
                total_price += shares_to_buy as f64 * top_sell_order.price;
                shares_bought += shares_to_buy;

                top_sell_order.cur_quantity -= shares_to_buy;
                top_sell_order.partially_sold = true;

                let sold_qty = shares_to_buy;
                shares_to_buy = 0;

                order_updates.push(OrderUpdate {
                    stock_id: top_sell_order.stock_id.clone(),
                    price: top_sell_order.price,
                    remaining_quantity: top_sell_order.cur_quantity,
                    sold_quantity: sold_qty,
                    stock_tx_id: top_sell_order.stock_tx_id.clone(),
                    user_name: top_sell_order.user_name.clone(),
                });

                // Reinsert the sell order back into the PQ since it is a partial sell
                state.matching_pq.insert(top_sell_order);
            };
        }

        let response = MarketBuyResponse {
            success: true,
            data: Some(MarketBuyData {
                stock_id: request.stock_id,
                stock_tx_id: request.stock_tx_id,
                quantity: shares_bought,
                price_total: total_price,
            }),
        };

        return MarketBuyResult {
            market_buy_response: response,
            order_updates: Some(order_updates),
        };
    }
}

impl Clone for OrderConsumer {
    fn clone(&self) -> Self {
        Self {
            state: Arc::clone(&self.state),
            rabbitmq_client: Arc::clone(&self.rabbitmq_client),
        }
    }
}

#[async_trait]
impl AsyncConsumer for OrderConsumer {
    async fn consume(
        &mut self,
        channel: &Channel,
        deliver: Deliver,
        _: BasicProperties,
        content: Vec<u8>,
    ) {
        let routing_key = deliver.routing_key().to_string();

        match routing_key.as_str() {
            "order.market_buy" => {
                if let Ok(request) = serde_json::from_slice::<MarketBuyRequest>(&content) {
                    let buy_result = self.process_market_buy(request).await;

                    // Publish buy completion event (as failure or success)
                    if let Err(e) = self
                        .rabbitmq_client
                        .publish_buy_completed(&buy_result.market_buy_response)
                        .await
                    {
                        eprintln!("Failed to publish buy completion event: {}", e);
                    }

                    // Publish all order updates
                    match buy_result.order_updates {
                        Some(order_updates) => {
                            for order in order_updates {
                                if let Err(e) =
                                    self.rabbitmq_client.publish_sale_update(&order).await
                                {
                                    eprintln!("Failed to publish order update: {}", e);
                                }
                            }
                        }
                        None => { /* do nothing */ }
                    }
                }
            }
            "order.limit_sell" => {
                if let Ok(request) = serde_json::from_slice::<LimitSellRequest>(&content) {
                    let sell_order = SellOrder {
                        stock_id: request.stock_id,
                        stock_tx_id: request.stock_tx_id,
                        price: request.price,
                        partially_sold: false,
                        ori_quantity: request.quantity,
                        cur_quantity: request.quantity,
                        user_name: request.user_name,
                    };

                    let mut state = self.state.write().await;
                    state.matching_pq.insert(sell_order);
                }
            }
            "order.limit_sell_cancellation" => {
                if let Ok(request) = serde_json::from_slice::<LimitSellCancelRequest>(&content) {
                    let mut state = self.state.write().await;

                    if let Some(order) = state
                        .matching_pq
                        .remove_order(&request.stock_id, &request.stock_tx_id)
                    {
                        // Publish cancellation response
                        let response = LimitSellCancelResponse {
                            success: true,
                            data: Some(LimitSellCancelData {
                                stock_id: order.stock_id,
                                stock_tx_id: order.stock_tx_id,
                                partially_sold: order.partially_sold,
                                ori_quantity: order.ori_quantity,
                                cur_quantity: order.cur_quantity,
                                sold_quantity: order.ori_quantity - order.cur_quantity,
                                price: order.price,
                            }),
                        };

                        if let Err(e) = self
                            .rabbitmq_client
                            .publish_order_cancelled(&response)
                            .await
                        {
                            eprintln!("Failed to publish cancellation response: {}", e);
                        }
                    } else {
                        let err_res = LimitSellCancelResponse {
                            success: false,
                            data: None,
                        };

                        if let Err(e) = self.rabbitmq_client.publish_order_cancelled(&err_res).await
                        {
                            eprintln!("Failed to publish cancellation response: {}", e);
                        }
                    }
                }
            }
            _ => {
                eprintln!("Unknown routing key: {}", routing_key);
            }
        }

        // Acknowledge the message
        let args = BasicAckArguments::new(deliver.delivery_tag(), false);
        if let Err(e) = channel.basic_ack(args).await {
            eprintln!("Failed to acknowledge message: {}", e);
        }
    }
}
