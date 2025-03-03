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
    // Load env from .env file or the environment
    dotenv().ok();

    // Initialize application state
    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Initialize RabbitMQ client
    let rabbitmq_config = RabbitMQConfig {
        host: env::var("RABBITMQ_HOST").unwrap_or_else(|_| "localhost".to_string()),
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

    // Keep the main thread alive
    println!("Matching engine started. Press Ctrl+C to exit.");
    tokio::signal::ctrl_c().await?;
    println!("Shutting down...");

    Ok(())
}
