use dotenvy::dotenv;
use serde::de;
use std::{env, sync::Arc};
use tokio::sync::RwLock;
use tracing::{debug, info, Level};
use tracing_subscriber::{field::debug, EnvFilter, FmtSubscriber};

mod consumers;
mod matching_pq;
mod models;
mod rabbitmq;
mod state;

use consumers::OrderConsumer;
use rabbitmq::{RabbitMQClient, RabbitMQConfig};
use state::AppState;

// Function to set up tracing with conditional logging
pub fn setup_tracing() {
    // Debug mode: detailed logging
    #[cfg(debug_assertions)]
    {
        let subscriber = FmtSubscriber::builder()
            .with_env_filter(
                EnvFilter::from_default_env()
                    .add_directive("matching_engine=debug".parse().unwrap()),
            )
            .with_target(true)
            .with_thread_ids(true)
            .with_file(true)
            .with_line_number(true)
            .pretty();
        let _ = subscriber.try_init();
    }

    // Release mode: log info and error levels
    #[cfg(not(debug_assertions))]
    {
        let subscriber = FmtSubscriber::builder().with_env_filter(
            EnvFilter::from_default_env().add_directive("matching_engine=info".parse().unwrap()), // This will include error logs too
        );
        let _ = subscriber.try_init();
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    setup_tracing();

    // Load env from .env file or the environment
    info!("Loading environment variables");
    dotenv().ok();

    // Initialize application state
    info!("Initializing application state");
    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Initialize RabbitMQ client with sharding configuration
    let rabbitmq_config = RabbitMQConfig {
        host: env::var("RABBITMQ_HOST").unwrap_or_else(|_| "localhost".to_string()),
        port: env::var("RABBITMQ_PORT")
            .unwrap_or_else(|_| "5672".to_string())
            .parse()
            .unwrap_or(5672),
        username: env::var("RABBITMQ_USERNAME").unwrap_or_else(|_| "guest".to_string()),
        password: env::var("RABBITMQ_PASSWORD").unwrap_or_else(|_| "guest".to_string()),
        shard_id: env::var("SHARD_ID")
            .unwrap_or_else(|_| "0".to_string())
            .parse()
            .unwrap_or(0),
    };

    info!(
        "Initializing RabbitMQ client with host={}, port={}, shardId={}",
        rabbitmq_config.host, rabbitmq_config.port, rabbitmq_config.shard_id
    );

    let rabbitmq_client = Arc::new(RabbitMQClient::new(rabbitmq_config).await?);
    info!("RabbitMQ client initialized successfully");

    // Initialize and setup order consumer
    info!("Setting up order consumer");
    let order_consumer = OrderConsumer::new(Arc::clone(&app_state), Arc::clone(&rabbitmq_client));
    order_consumer.setup().await?;
    info!("Order consumer setup completed");

    // Keep the main thread alive
    info!("Matching engine started and ready to process orders. Press Ctrl+C to exit.");
    tokio::signal::ctrl_c().await?;
    info!("Received shutdown signal, cleaning up...");

    Ok(())
}
