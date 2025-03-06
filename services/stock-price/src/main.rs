mod consumer;
mod get_stock_prices;
mod jwt_middleware;
mod rabbitmq;
mod state;

use amqprs::channel::BasicConsumeArguments;
use axum::{Router, middleware::from_fn, routing::get};
use std::{env, sync::Arc};
use tracing::{info, debug};
use tracing_subscriber::{FmtSubscriber, EnvFilter};

use crate::consumer::PriceConsumer;
use crate::get_stock_prices::get_stock_prices;
use crate::jwt_middleware::jwt_middleware;
use crate::state::AppState;

pub fn setup_tracing() {
    // Debug mode: detailed logging
    #[cfg(debug_assertions)]
    {
        let subscriber = FmtSubscriber::builder()
            .with_env_filter(
                EnvFilter::from_default_env()
                    .add_directive("stock_price=debug".parse().unwrap()),
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
            EnvFilter::from_default_env().add_directive("stock_price=info".parse().unwrap()),
        );
        let _ = subscriber.try_init();
    }
}

#[tokio::main]
async fn main() {
    setup_tracing();
    info!("Starting stock price service");

    // Setup RabbitMQ connection and channel
    let exchange_name = "stock_prices_exchange";
    let queue_name = "stock_prices_queue";
    let consumer_tag = "stock_price_consumer";
    let binding_key = "stock.price.*";

    debug!("Setting up RabbitMQ with exchange: {}, queue: {}", exchange_name, queue_name);
    let (connection, channel) =
        rabbitmq::setup_rabbitmq(exchange_name, queue_name, binding_key).await;

    let app_state = Arc::new(tokio::sync::RwLock::new(AppState::new()));
    let price_consumer = PriceConsumer::new(app_state.clone());

    let mut consume_args = BasicConsumeArguments::new(queue_name, consumer_tag);
    consume_args.manual_ack(false);
    channel
        .basic_consume(price_consumer, consume_args)
        .await
        .unwrap();

    // Build router with JWT middleware applied to /stockPrices route
    let app = Router::new()
        .route(
            "/stockPrices",
            get(get_stock_prices).layer(from_fn(jwt_middleware)),
        )
        .with_state(app_state);
    let port: String = env::var("PORT").unwrap_or("3000".to_string());
    let server_endpoint = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(server_endpoint.clone())
        .await
        .unwrap();
    info!("Stock Prices Service listening on {server_endpoint}");

    // Store connection and channel in variables that won't go out of scope
    // This prevents them from being dropped
    let _connection = connection;
    let _channel = channel;
    axum::serve(listener, app).await.unwrap();
}
