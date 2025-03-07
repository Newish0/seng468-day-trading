use amqprs::{
    channel::{BasicAckArguments, Channel},
    consumer::AsyncConsumer,
    BasicProperties, Deliver,
};
use async_trait::async_trait;
use std::{cmp::Reverse, sync::Arc};
use tokio::sync::RwLock;
use tracing::{debug, error, info, warn};
use tracing_subscriber::field::debug;

use crate::{
    matching_pq::SellOrder,
    models::{
        LimitSellCancelData, LimitSellCancelRequest, LimitSellCancelResponse, LimitSellRequest,
        MarketBuyData, MarketBuyRequest, MarketBuyResponse, OrderUpdate, StockPrice,
    },
    rabbitmq::RabbitMQClient,
    state::AppState,
};

pub struct OrderConsumer {
    state: Arc<RwLock<AppState>>,
    rabbitmq_client: Arc<RabbitMQClient>,
}

#[derive(Debug)]
struct MarketBuyResult {
    market_buy_response: MarketBuyResponse,
    order_updates: Option<Vec<OrderUpdate>>,
    have_completed_sell: bool, // True if at least one sell order was fully completed
}

impl OrderConsumer {
    pub fn new(state: Arc<RwLock<AppState>>, client: Arc<RabbitMQClient>) -> Self {
        info!("Creating new OrderConsumer instance");
        Self {
            state,
            rabbitmq_client: client,
        }
    }

    pub async fn setup(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Setting up OrderConsumer");
        self.rabbitmq_client.setup_consumer(self.clone()).await
    }

    fn create_mk_buy_fail_result(&self, stock_id: String, stock_tx_id: String) -> MarketBuyResult {
        warn!(
            "Creating failed market buy result for stock_id={}, tx_id={}",
            stock_id, stock_tx_id
        );
        MarketBuyResult {
            market_buy_response: MarketBuyResponse {
                success: false,
                data: MarketBuyData {
                    stock_id: stock_id,
                    stock_tx_id: stock_tx_id,
                    price_total: None,
                    quantity: None,
                },
            },
            order_updates: None,
            have_completed_sell: false,
        }
    }

    /// Helper for performing market buy
    async fn process_market_buy(&self, request: MarketBuyRequest) -> MarketBuyResult {
        // Need to have lock the entire time to ensure no other sell occurs
        // between ensuring we have enough shares and the actual buy/sell process.

        debug!(
            "Processing market buy request: stock={}, quantity={}, budget={}, user={}",
            request.stock_id, request.quantity, request.budget, request.user_name
        );

        let mut state = self.state.write().await;

        // Total number of shares on sale excluding those from the user requesting the buy order
        let available_shares: u64 = state
            .matching_pq
            .get_all_orders(&request.stock_id)
            .iter()
            .filter(|sell_order| sell_order.user_name != request.user_name)
            .map(|sell_order| sell_order.cur_quantity)
            .sum();

        debug!(
            "Available shares for stock {}: {} (requested: {})",
            request.stock_id, available_shares, request.quantity
        );

        // Check available shares
        let mut shares_to_buy = request.quantity;
        if shares_to_buy > available_shares {
            warn!(
                "Insufficient shares available for stock {}: available={}, requested={}",
                request.stock_id, available_shares, shares_to_buy
            );
            return self.create_mk_buy_fail_result(request.stock_id, request.stock_tx_id);
        }

        // Dry-run: Clone the priority queue to calculate total cost without modifying state
        // OPTIMIZE: This implementation is wildly inefficient but future problem it is!
        // REFACTOR: Too much duplicate code between the dry run and the actual run.
        let Some(original_queue) = state
            .matching_pq
            .get_stock_queue(&request.stock_id)
            .cloned()
        else {
            return self.create_mk_buy_fail_result(request.stock_id, request.stock_tx_id);
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

        debug!("Dry run calculation: total_price={}", total_price_dry);

        // Budget validation
        if total_price_dry > request.budget {
            warn!(
                "Insufficient budget for market buy: required={}, available={}",
                total_price_dry, request.budget
            );
            return self.create_mk_buy_fail_result(request.stock_id, request.stock_tx_id);
        }

        // Proceed with actual purchase processing
        let mut total_price = 0.0;
        let mut shares_bought = 0;
        let mut order_updates: Vec<OrderUpdate> = Vec::new();
        let mut have_completed_sell = false;
        while shares_to_buy > 0 {
            // Assume the sell order always exist due to the above shares quantity check.
            // If it somehow fails, we will break out early. But it is a critical issue at this point.
            let Some(mut top_sell_order) = state.matching_pq.pop(&request.stock_id) else {
                error!(
                    "Critical: Performing actual buy when there isn't enough valid shares to buy"
                );
                break;
            };

            // Skip if the sell order is from the user requesting the buy order
            if top_sell_order.user_name == request.user_name {
                debug!("Skipping sell order from same user: {}", request.user_name);
                continue;
            }

            let purchase_all = shares_to_buy >= top_sell_order.cur_quantity;
            debug!(
                "Processing sell order: price={}, quantity={}, purchase_all={}",
                top_sell_order.price, top_sell_order.cur_quantity, purchase_all
            );

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

                have_completed_sell = true;
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

            debug!(
                "Processed order: shares_bought={}, remaining_to_buy={}, total_price={}",
                shares_bought, shares_to_buy, total_price
            );
        }

        debug!(
            "Market buy completed: shares={}, total_price={}, updates={}",
            shares_bought,
            total_price,
            order_updates.len()
        );

        let response = MarketBuyResponse {
            success: true,
            data: MarketBuyData {
                stock_id: request.stock_id,
                stock_tx_id: request.stock_tx_id,
                quantity: Some(shares_bought),
                price_total: Some(total_price),
            },
        };

        return MarketBuyResult {
            market_buy_response: response,
            order_updates: Some(order_updates),
            have_completed_sell,
        };
    }

    /// Helper for publishing stock price.
    /// Send in the latest stock price or `None` (AKA `null`) if it does not exist.
    async fn publish_stock_price_helper(&self, stock_id: &str) {
        debug!("Publishing stock price update for {}", stock_id);
        let payload: StockPrice = {
            let state = self.state.read().await;
            if let Some(top_order) = state.matching_pq.peek(stock_id) {
                debug!(
                    "Current price for {}: {} ({})",
                    stock_id, top_order.price, top_order.stock_name
                );
                StockPrice {
                    stock_id: stock_id.to_string(),
                    stock_name: Some(top_order.stock_name.clone()),
                    current_price: Some(top_order.price),
                }
            } else {
                warn!("No price available for stock {}", stock_id);
                StockPrice {
                    stock_id: stock_id.to_string(),
                    stock_name: None,
                    current_price: None,
                }
            }
        };

        if let Err(e) = self
            .rabbitmq_client
            .publish_stock_price(payload.clone())
            .await
        {
            error!(
                "Failed to publish latest stock price for {}: {}",
                stock_id, e
            );
        } else {
            debug!(
                "Published stock price update: id={}, name={:?}, price={:?}",
                payload.stock_id, payload.stock_name, payload.current_price
            );
        }
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
        debug!(
            "Received message with routing key: {} (delivery tag: {})",
            routing_key,
            deliver.delivery_tag()
        );

        // Extract the order type from routing key pattern: order.{order_type}.shard_{shard_id}
        let parts: Vec<&str> = routing_key.split('.').collect();

        // Handle the message based on the order type part of the routing key
        match parts.get(1) {
            Some(&"market_buy") => {
                if let Ok(request) = serde_json::from_slice::<MarketBuyRequest>(&content) {
                    let stock_id = request.stock_id.clone(); // Save for later
                    let buy_result = self.process_market_buy(request).await;

                    // Publish buy completion event (as failure or success)
                    if let Err(e) = self
                        .rabbitmq_client
                        .publish_buy_completed(&buy_result.market_buy_response)
                        .await
                    {
                        error!("Failed to publish buy completion event: {}", e);
                    }

                    // Publish all order updates
                    match buy_result.order_updates {
                        Some(order_updates) => {
                            for order in order_updates {
                                if let Err(e) =
                                    self.rabbitmq_client.publish_sale_update(&order).await
                                {
                                    error!("Failed to publish order update: {}", e);
                                }
                            }
                        }
                        None => { /* do nothing */ }
                    }

                    // Publish latest stock price
                    if buy_result.have_completed_sell {
                        self.publish_stock_price_helper(&stock_id).await;
                    }
                } else {
                    error!("Failed to parse market buy order",);
                    debug!(
                        "Parse Failure Content: {}",
                        String::from_utf8_lossy(&content)
                    );
                }
            }
            Some(&"limit_sell") => {
                if let Ok(request) = serde_json::from_slice::<LimitSellRequest>(&content) {
                    let stock_id = request.stock_id.clone(); // Save for later
                    let sell_order = SellOrder {
                        stock_id: request.stock_id,
                        stock_name: request.stock_name,
                        stock_tx_id: request.stock_tx_id,
                        price: request.price,
                        partially_sold: false,
                        ori_quantity: request.quantity,
                        cur_quantity: request.quantity,
                        user_name: request.user_name,
                    };

                    let mut state = self.state.write().await;
                    state.matching_pq.insert(sell_order);
                    drop(state); // Release write lock

                    // Publish latest stock price
                    // TODO: only publish if price has changed
                    self.publish_stock_price_helper(&stock_id).await;
                } else {
                    error!("Failed to parse limit sell order");
                    debug!(
                        "Parse Failure Content: {}",
                        String::from_utf8_lossy(&content)
                    );
                }
            }
            Some(&"limit_sell_cancellation") => {
                if let Ok(request) = serde_json::from_slice::<LimitSellCancelRequest>(&content) {
                    let some_order = {
                        let mut state = self.state.write().await;
                        state
                            .matching_pq
                            .remove_order(&request.stock_id, &request.stock_tx_id)
                    }; // Release write lock

                    if let Some(order) = some_order {
                        let stock_id = order.stock_id.clone(); // Save for later

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
                            error!("Failed to publish cancellation response: {}", e);
                        }

                        // Publish latest stock price
                        // TODO: only publish if price has changed
                        self.publish_stock_price_helper(&stock_id).await;
                    } else {
                        let err_res = LimitSellCancelResponse {
                            success: false,
                            data: None,
                        };

                        if let Err(e) = self.rabbitmq_client.publish_order_cancelled(&err_res).await
                        {
                            error!("Failed to publish cancellation response: {}", e);
                        }
                    }
                } else {
                    error!("Failed to parse limit sell cancellation order");
                    debug!(
                        "Parse Failure Content: {}",
                        String::from_utf8_lossy(&content)
                    );
                }
            }
            _ => {
                error!("Unknown routing key: {}", routing_key);
            }
        }

        // Acknowledge the message
        let args = BasicAckArguments::new(deliver.delivery_tag(), false);
        if let Err(e) = channel.basic_ack(args).await {
            error!("Failed to acknowledge message: {}", e);
        }
    }
}
