use dotenvy::dotenv;
use std::{env, sync::Arc};
use tokio::sync::RwLock;

mod consumers;
mod matching_pq;
mod models;
mod rabbitmq;
mod state;

use consumers::OrderConsumer;
use rabbitmq::{RabbitMQClient, RabbitMQConfig};
use state::AppState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from Docker or environment directly
    dotenv().ok();

    // Initialize application state
    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Initialize RabbitMQ client
    let rabbitmq_config = RabbitMQConfig {
        host: env::var("RABBITMQ_HOST").unwrap_or_else(|_| "rabbitmq".to_string()),
        port: env::var("RABBITMQ_PORT")
            .unwrap_or_else(|_| "5672".to_string())
            .parse()
            .unwrap_or(5672),
        username: env::var("RABBITMQ_USERNAME").unwrap_or_else(|_| "guest".to_string()),
        password: env::var("RABBITMQ_PASSWORD").unwrap_or_else(|_| "guest".to_string()),
    };

    let rabbitmq_client = Arc::new(RabbitMQClient::new(rabbitmq_config).await?);

    // Initialize and setup order consumer
    let order_consumer = OrderConsumer::new(Arc::clone(&app_state), Arc::clone(&rabbitmq_client));
    order_consumer.setup().await?;

    // HACK: This is a tmp solution.
    // Start a background task to periodically publish stock prices
    let state_clone = Arc::clone(&app_state);
    let client_clone = Arc::clone(&rabbitmq_client);
    tokio::spawn(async move {
        loop {
            let state = state_clone.read().await;
            for stock_id in state.matching_pq.get_all_stocks() {
                if let Some(top_order) = state.matching_pq.peek(&stock_id) {
                    if let Err(e) = client_clone
                        .publish_stock_price(&stock_id, top_order.price)
                        .await
                    {
                        eprintln!("Failed to publish stock price: {}", e);
                    }
                }
            }
            drop(state);
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        }
    });

    // Keep the main thread alive
    println!("Matching engine started. Press Ctrl+C to exit.");
    tokio::signal::ctrl_c().await?;
    println!("Shutting down...");

    Ok(())
}
