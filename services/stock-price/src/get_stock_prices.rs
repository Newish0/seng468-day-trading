use axum::{Json, extract::State};
use tracing::debug;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::state::{AppState, StockPrice, StockPricesResponse};

pub async fn get_stock_prices(
    State(prices): State<Arc<RwLock<AppState>>>,
) -> Json<StockPricesResponse> {
    debug!("Retrieving current stock prices");
    let prices = prices.read().await;

    let mut prices: Vec<StockPrice> = prices
        .stock_prices
        .iter()
        .map(|(_, stock_price)| stock_price.clone())
        .collect();

    // Sort by stock_name in descending order (case-insensitive)
    prices.sort_by(|a, b| {
        let name_a = a.stock_name.to_uppercase();
        let name_b = b.stock_name.to_uppercase();
        name_b.cmp(&name_a)
    });

    debug!("Returning {} stock prices", prices.len());
    Json(StockPricesResponse {
        success: true,
        data: Some(prices),
    })
}
