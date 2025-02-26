use crate::state::{AppState, StockPrice};
use amqprs::{BasicProperties, Deliver, channel::Channel, consumer::AsyncConsumer};
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;

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
        let stock_price: StockPrice = match serde_json::from_slice(&content) {
            Ok(sp) => sp,
            Err(e) => {
                eprintln!("Failed to deserialize message: {}", e);
                return;
            }
        };

        // add a new stock_id if the key doesn't exist or update the existing entry if the key already exists
        let mut state = self.state.write().await;
        state
            .stock_prices
            .insert(stock_price.stock_id.clone(), stock_price);
    }
}
