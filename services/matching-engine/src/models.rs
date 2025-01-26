use serde::{Deserialize, Serialize};

// Stock prices types
#[derive(Serialize)]
pub struct StockPrice {
    pub stock_id: String,
    pub current_price: f64,
}

#[derive(Serialize)]
pub struct StockPricesResponse {
    pub success: bool,
    pub data: Option<Vec<StockPrice>>,
}

// Market buy types
#[derive(Deserialize)]
pub struct MarketBuyRequest {
    pub stock_id: String,
    pub quantity: u32,
    pub stock_tx_id: String,
}

#[derive(Serialize)]
pub struct MarketBuyResponse {
    pub success: bool,
    pub data: Option<MarketBuyData>,
}

#[derive(Serialize)]
pub struct MarketBuyData {
    pub stock_id: String,
    pub stock_tx_id: String,
    pub quantity: u32,
    pub price_total: f64,
}

// Limit sell types
#[derive(Deserialize)]
pub struct LimitSellRequest {
    pub stock_id: String,
    pub quantity: u32,
    pub price: f64,
    pub stock_tx_id: String,
}

#[derive(Serialize)]
pub struct LimitSellResponse {
    pub success: bool,
}

#[derive(Serialize)]
pub struct LimitSellCancelResponse {
    pub success: bool,
    pub data: Option<LimitSellCancelData>,
}

#[derive(Serialize)]
pub struct LimitSellCancelData {
    pub stock_id: String,
    pub stock_tx_id: String,
    pub partially_sold: bool,
    pub ori_quantity: u32,
    pub cur_quantity: u32,
    pub sold_quantity: u32,
    pub price: f64,
}
