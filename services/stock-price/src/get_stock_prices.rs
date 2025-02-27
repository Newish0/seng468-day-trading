use axum::{Json, extract::State};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::state::{AppState, StockPrice, StockPricesResponse};

pub async fn get_stock_prices(
    State(prices): State<Arc<RwLock<AppState>>>,
) -> Json<StockPricesResponse> {
    let prices = prices.read().await;

    let prices: Vec<StockPrice> = prices
        .stock_prices
        .iter()
        .map(|(_, stock_price)| stock_price.clone())
        .collect();

    Json(StockPricesResponse {
        success: true,
        data: Some(prices),
    })
}
