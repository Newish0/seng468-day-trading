use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Stock prices types
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct StockPrice {
    pub stock_id: String,
    pub current_price: i64,
    pub stock_name: String,
}

#[derive(Serialize, Debug, Default, Clone)]
pub struct AppState {
    pub stock_prices: HashMap<String, StockPrice>,
}

#[derive(Serialize, Debug)]
pub struct StockPricesResponse {
    pub success: bool,
    pub data: Option<Vec<StockPrice>>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
}
