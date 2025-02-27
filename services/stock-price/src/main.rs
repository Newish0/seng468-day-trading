mod consumer;
mod get_stock_prices;
mod rabbitmq;
mod state; // new import

use amqprs::channel::BasicConsumeArguments;
use axum::{Router, routing::get};
use std::{env, sync::Arc};

use crate::consumer::PriceConsumer;
use crate::get_stock_prices::get_stock_prices;
use crate::state::AppState;

#[tokio::main]
async fn main() {
    // Setup RabbitMQ connection and channel
    let (connection, channel) = rabbitmq::setup_rabbitmq().await;

    let app_state = Arc::new(tokio::sync::RwLock::new(AppState::new()));
    let price_consumer = PriceConsumer::new(app_state.clone());

    let queue_name = "stock_prices_queue";
    let mut consume_args = BasicConsumeArguments::new(queue_name, "stock_price_consumer");
    consume_args.manual_ack(false);
    channel
        .basic_consume(price_consumer, consume_args)
        .await
        .unwrap();

    // Build router
    let app = Router::new()
        .route("/stockPrices", get(get_stock_prices))
        .with_state(app_state);
    let port: String = env::var("PORT").unwrap_or("3000".to_string());
    let server_endpoint = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(server_endpoint.clone())
        .await
        .unwrap();
    println!("Stock Prices Service listening on {server_endpoint}");

    // Store connection and channel in variables that won't go out of scope
    // This prevents them from being dropped
    let _connection = connection;
    let _channel = channel;
    axum::serve(listener, app).await.unwrap();
}
