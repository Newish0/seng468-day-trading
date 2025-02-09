use axum::{extract::State, Json};
use std::env;
use std::{cmp::Reverse, sync::Arc};
use tokio::sync::RwLock;

use crate::{
    matching_pq::SellOrder,
    models::{
        LimitSellCancelData, LimitSellCancelResponse, LimitSellRequest, LimitSellResponse,
        MarketBuyData, MarketBuyRequest, MarketBuyResponse, StockPrice, StockPricesResponse,
    },
    order_service::{self, OrderService, OrderServiceConfig, OrderUpdate},
    state::AppState,
};

pub async fn get_stock_prices(
    State(state): State<Arc<RwLock<AppState>>>,
) -> Json<StockPricesResponse> {
    let state = state.read().await;
    let prices: Vec<StockPrice> = state
        .matching_pq
        .get_all_stocks()
        .iter()
        // Only include stocks that have a price (which should be all of them)
        .filter_map(|stock_id| {
            let price = state.matching_pq.peek(stock_id).map(|order| order.price)?; // try to get stock price

            // DEBUG: Output the full stock order in the PQ for debugging
            #[cfg(debug_assertions)]
            {
                let trans = state.matching_pq.get_all_orders(stock_id);
                println!("{:?}", trans);
            }

            Some(StockPrice {
                current_price: price,
                stock_id: stock_id.clone(),
            })
        })
        .collect();

    Json(StockPricesResponse {
        success: true,
        data: Some(prices),
    })
}

pub async fn market_buy(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<MarketBuyRequest>,
) -> Json<MarketBuyResponse> {
    // Need to have lock the entire time to ensure no other sell occurs
    // between ensuring we have enough shares and the actual buy/sell process.
    let mut state = state.write().await;

    // Total number of shares on sale excluding those from the user requesting the buy order.
    let available_shares: u32 = state
        .matching_pq
        .get_all_orders(&payload.stock_id)
        .iter()
        .filter(|sell_order| sell_order.user_name != payload.user_name)
        .map(|sell_order| sell_order.cur_quantity)
        .sum();

    // Check available shares
    let mut shares_to_buy = payload.quantity;
    if shares_to_buy > available_shares {
        return Json(MarketBuyResponse {
            success: false,
            data: None,
        });
    }

    // Dry-run: Clone the priority queue to calculate total cost without modifying state
    // OPTIMIZE: This implementation is wildly inefficient but future problem it is!
    // REFACTOR: Too much duplicate code between the dry run and the actual run.
    let Some(original_queue) = state
        .matching_pq
        .get_stock_queue(&payload.stock_id)
        .cloned()
    else {
        return Json(MarketBuyResponse {
            success: false,
            data: None,
        });
    };

    let mut cloned_queue = original_queue;
    let mut total_price_dry = 0.0;
    let mut remaining_dry = shares_to_buy; // make copy

    while remaining_dry > 0 {
        if let Some(Reverse(order)) = cloned_queue.pop() {
            // Skip if the sell order is from the user requesting the buy order.
            if order.user_name == payload.user_name {
                continue;
            }

            let take = remaining_dry.min(order.cur_quantity);
            total_price_dry += take as f64 * order.price;
            remaining_dry -= take;
        } else {
            break; // Should not occur due to available_shares check
        }
    }

    // Budget validation
    if total_price_dry > payload.budget {
        return Json(MarketBuyResponse {
            success: false,
            data: None,
        });
    }

    // Proceed with actual purchase processing
    let mut total_price = 0.0;
    let mut shares_bought = 0;
    while shares_to_buy > 0 {
        // Assume the sell order always exist due to the above shares quantity check; unwrap is ok.
        let mut top_sell_order = state.matching_pq.pop(&payload.stock_id).unwrap();

        // Skip if the sell order is from the user requesting the buy order.
        if top_sell_order.user_name == payload.user_name {
            continue;
        }

        let purchase_all = shares_to_buy >= top_sell_order.cur_quantity;

        // Complete the top sell order or perform partial sell on the top sell order
        let order_update = if purchase_all {
            total_price += top_sell_order.cur_quantity as f64 * top_sell_order.price;
            shares_bought += top_sell_order.cur_quantity;

            shares_to_buy -= top_sell_order.cur_quantity;

            let sold_qty = top_sell_order.cur_quantity; // make copy
            top_sell_order.cur_quantity = 0;

            OrderUpdate {
                stock_id: top_sell_order.stock_id.clone(),
                price: top_sell_order.price,
                remaining_quantity: top_sell_order.cur_quantity,
                sold_quantity: sold_qty,
                stock_tx_id: top_sell_order.stock_tx_id.clone(),
                user_name: top_sell_order.user_name.clone(),
            }
        } else {
            total_price += shares_to_buy as f64 * top_sell_order.price;
            shares_bought += shares_to_buy;

            top_sell_order.cur_quantity -= shares_to_buy;
            top_sell_order.partially_sold = true;

            let sold_qty = shares_to_buy; // make copy
            shares_to_buy = 0;

            let update = OrderUpdate {
                stock_id: top_sell_order.stock_id.clone(),
                price: top_sell_order.price,
                remaining_quantity: top_sell_order.cur_quantity,
                sold_quantity: sold_qty,
                stock_tx_id: top_sell_order.stock_tx_id.clone(),
                user_name: top_sell_order.user_name.clone(),
            };

            // Reinsert the sell order back into the PQ since it is a partial sell
            state.matching_pq.insert(top_sell_order);

            update
        };

        // Get the base url from the environment variable, with a default if not found
        let base_url =
            env::var("ORDER_SERVICE_URL").unwrap_or_else(|_| "http://order:3000".to_string());

        // DEBUG: Output the request to order service
        #[cfg(debug_assertions)]
        {
            println!("Send sale update to {base_url}");
            println!("{:?}", order_update);
        }

        let order_service = OrderService::new(OrderServiceConfig {
            base_url,
            max_retries: 3,
            base_retry_delay_secs: 2,
        });

        tokio::spawn(async move {
            match order_service.update_sale(order_update).await {
                Ok(_) => (), // Don't need further action on success
                Err(_) => {
                    println!("TODO: What do we do when we fail to call the order service? ")
                } // TODO: What do we do when we fail to call the order service? 
            }
        });
    } // while

    Json(MarketBuyResponse {
        success: true,
        data: Some(MarketBuyData {
            stock_id: payload.stock_id,
            stock_tx_id: payload.stock_tx_id,
            quantity: shares_bought,
            price_total: total_price,
        }),
    })
}

pub async fn limit_sell(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<LimitSellRequest>,
) -> Json<LimitSellResponse> {
    let sell_order = SellOrder {
        stock_id: payload.stock_id,
        stock_tx_id: payload.stock_tx_id,
        price: payload.price,
        partially_sold: false,
        ori_quantity: payload.quantity,
        cur_quantity: payload.quantity,
        user_name: payload.user_name,
    };

    {
        let mut state = state.write().await;
        state.matching_pq.insert(sell_order);
    } // Drop lock

    Json(LimitSellResponse { success: true })
}

pub async fn cancel_limit_sell(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<LimitSellRequest>,
) -> Json<LimitSellCancelResponse> {
    let some_sell_order = {
        let mut state = state.write().await;
        state
            .matching_pq
            .remove_order(&payload.stock_id, &payload.stock_tx_id)
    }; // minimize lock time

    match some_sell_order {
        Some(sell_order) => Json(LimitSellCancelResponse {
            success: true,
            data: Some(LimitSellCancelData {
                stock_id: sell_order.stock_id,
                stock_tx_id: sell_order.stock_tx_id,
                partially_sold: sell_order.partially_sold,
                price: sell_order.price,
                cur_quantity: sell_order.cur_quantity,
                ori_quantity: sell_order.ori_quantity,
                sold_quantity: sell_order.ori_quantity - sell_order.cur_quantity,
            }),
        }),
        None => Json(LimitSellCancelResponse {
            success: false,
            data: None,
        }),
    }
}
