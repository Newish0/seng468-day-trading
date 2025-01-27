use axum::{extract::State, Json};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::{
    matching_pq::SellOrder,
    models::{
        LimitSellCancelData, LimitSellCancelResponse, LimitSellRequest, LimitSellResponse,
        MarketBuyData, MarketBuyRequest, MarketBuyResponse, StockPrice, StockPricesResponse,
    },
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
    // TODO: add payload validation with serde_validate?

    // Need to have lock the entire time to ensure no other sell occurs
    // between ensuring we have enough shares and the actual buy/sell process.
    let mut state = state.write().await;

    let available_shares: u32 = state
        .matching_pq
        .get_all_orders(&payload.stock_id)
        .iter()
        .map(|sell_order| sell_order.cur_quantity)
        .sum();

    let mut shares_to_buy = payload.quantity;
    if shares_to_buy > available_shares {
        return Json(MarketBuyResponse {
            success: false,
            data: None,
        });
    }

    let mut total_price = 0.0;
    let mut shares_bought = 0;
    while shares_to_buy > 0 {
        // Assume the sell order always exist due to the above shares quantity check; unwrap is ok.
        let mut top_sell_order = state.matching_pq.pop(&payload.stock_id).unwrap();
        let purchase_all = shares_to_buy >= top_sell_order.cur_quantity;

        // Complete the top sell order or perform partial sell on the top sell order
        if purchase_all {
            total_price += top_sell_order.cur_quantity as f64 * top_sell_order.price;
            shares_bought += top_sell_order.cur_quantity;

            shares_to_buy -= top_sell_order.cur_quantity;
            top_sell_order.cur_quantity = 0;

            // TODO: Send complete sell request to Order service
        } else {
            total_price += shares_to_buy as f64 * top_sell_order.price;
            shares_bought += shares_to_buy;

            top_sell_order.cur_quantity -= shares_to_buy;
            top_sell_order.partially_sold = true;
            shares_to_buy = 0;

            // TODO: Send partial sell request to Order service

            // Reinsert the sell order back into the PQ since it is a partial sell
            state.matching_pq.insert(top_sell_order);
        }
    }

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
    // TODO: Implement payload validation with serde_validate?

    let sell_order = SellOrder {
        stock_id: payload.stock_id,
        stock_tx_id: payload.stock_tx_id,
        price: payload.price,
        partially_sold: false,
        ori_quantity: payload.quantity,
        cur_quantity: payload.quantity,
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
    // TODO: Implement payload validation with serde_validate?

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
