use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{BasicConsumeArguments, QueueBindArguments, QueueDeclareArguments},
    connection::{Connection, OpenConnectionArguments},
};
use axum::{Router, routing::get};
use std::{env, sync::Arc};

mod consumer;
mod get_stock_prices;
mod state;

use crate::consumer::PriceConsumer;
use crate::get_stock_prices::get_stock_prices;
use crate::state::AppState;

#[tokio::main]
async fn main() {
    // Initialize RabbitMQ client configuration
    let host = env::var("RABBITMQ_HOST").unwrap_or_else(|_| "localhost".to_string());
    let port = env::var("RABBITMQ_PORT")
        .unwrap_or_else(|_| "5672".to_string())
        .parse()
        .unwrap_or(5672);
    let username = env::var("RABBITMQ_USERNAME").unwrap_or_else(|_| "guest".to_string());
    let password = env::var("RABBITMQ_PASSWORD").unwrap_or_else(|_| "guest".to_string());

    // Open a connection to the RabbitMQ server.
    let connection = Connection::open(&OpenConnectionArguments::new(
        &host, port, &username, &password,
    ))
    .await
    .unwrap();
    connection
        .register_callback(DefaultConnectionCallback)
        .await
        .unwrap();

    // Open a channel on the connection.
    let channel = connection.open_channel(None).await.unwrap();
    channel
        .register_callback(DefaultChannelCallback)
        .await
        .unwrap();

    let exchange_name = "stock_prices_exchange";
    let queue_name = "stock_prices_queue";
    channel
        .queue_declare(QueueDeclareArguments::new(&queue_name))
        .await
        .unwrap();

    // Bind the queue to the topic exchange stock.price.*
    let binding_key = "stock.price.*";
    channel
        .queue_bind(QueueBindArguments::new(
            &queue_name,
            exchange_name,
            binding_key,
        ))
        .await
        .unwrap();

    println!(
        "Connected to exchange '{}', consuming from queue '{}'",
        exchange_name, queue_name
    );

    let app_state = Arc::new(tokio::sync::RwLock::new(AppState::new()));

    let price_consumer = PriceConsumer::new(app_state.clone());

    let mut consume_args = BasicConsumeArguments::new(&queue_name, "stock_price_consumer");
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

    // Run server
    let listener = tokio::net::TcpListener::bind(server_endpoint.clone())
        .await
        .unwrap();
    println!("Stock Prices Service listening on {server_endpoint}");
    axum::serve(listener, app).await.unwrap();
}
