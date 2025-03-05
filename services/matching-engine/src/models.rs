use serde::{Deserialize, Serialize};

// Stock prices types
#[derive(Serialize, Debug, Clone)]
pub struct StockPrice {
    pub stock_id: String,
    pub stock_name: Option<String>, // None/null if stock is no longer available
    pub current_price: Option<f64>, // None/null if stock is no longer available
}

// Market buy types
#[derive(Deserialize, Debug)]
pub struct MarketBuyRequest {
    pub stock_id: String,
    pub quantity: u64,
    pub stock_tx_id: String,
    pub budget: f64,
    pub user_name: String,
}

#[derive(Serialize, Debug)]
pub struct MarketBuyResponse {
    pub success: bool,
    pub data: MarketBuyData,
}

#[derive(Serialize, Debug)]
pub struct MarketBuyData {
    pub stock_id: String,
    pub stock_tx_id: String,
    pub quantity: Option<u64>, // None if success is false
    pub price_total: Option<f64>, // None if success is false
}

// Limit sell types
#[derive(Deserialize, Debug)]
pub struct LimitSellRequest {
    pub stock_id: String,
    pub stock_name: String,
    pub quantity: u64,
    pub price: f64,
    pub stock_tx_id: String,
    pub user_name: String,
}
#[derive(Deserialize, Debug)]
pub struct LimitSellCancelRequest {
    pub stock_id: String,
    pub quantity: u64,
    pub price: f64,
    pub stock_tx_id: String,
}

#[derive(Serialize, Debug)]
pub struct LimitSellResponse {
    pub success: bool,
}

#[derive(Serialize, Debug)]
pub struct LimitSellCancelResponse {
    pub success: bool,
    pub data: Option<LimitSellCancelData>,
}

#[derive(Serialize, Debug)]
pub struct LimitSellCancelData {
    pub stock_id: String,
    pub stock_tx_id: String,
    pub partially_sold: bool,
    pub ori_quantity: u64,
    pub cur_quantity: u64,
    pub sold_quantity: u64,
    pub price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderUpdate {
    pub stock_id: String,
    pub sold_quantity: u64,
    pub remaining_quantity: u64,
    pub price: f64,
    pub stock_tx_id: String,
    pub user_name: String,
}
