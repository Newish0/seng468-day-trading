use crate::state::{AppState, StockPrice};
use amqprs::{BasicProperties, Deliver, channel::Channel, consumer::AsyncConsumer};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PriceUpdate {
    pub stock_id: String,
    pub stock_name: Option<String>,
    pub current_price: Option<f64>,
}

pub struct PriceConsumer {
    pub state: Arc<RwLock<AppState>>,
}

impl PriceConsumer {
    pub fn new(state: Arc<RwLock<AppState>>) -> Self {
        Self { state }
    }
}

#[async_trait]
impl AsyncConsumer for PriceConsumer {
    async fn consume(&mut self, _: &Channel, _: Deliver, _: BasicProperties, content: Vec<u8>) {
        let price_update: PriceUpdate = match serde_json::from_slice(&content) {
            Ok(pu) => pu,
            Err(e) => {
                eprintln!("Failed to deserialize message: {}", e);
                return;
            }
        };

        let mut state = self.state.write().await;
        if price_update.current_price.is_some() && price_update.stock_name.is_some() {
            let stock_price = StockPrice {
                stock_id: price_update.stock_id.clone(),
                stock_name: price_update.stock_name.unwrap(),
                current_price: price_update.current_price.unwrap().round() as i64,
            };
            state
                .stock_prices
                .insert(price_update.stock_id, stock_price);
        } else {
            state.stock_prices.remove(&price_update.stock_id);
        }
    }
}
