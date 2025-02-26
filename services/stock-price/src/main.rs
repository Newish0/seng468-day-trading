use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{BasicConsumeArguments, QueueBindArguments, QueueDeclareArguments},
    connection::{Connection, OpenConnectionArguments},
};
mod consumer;

use crate::consumer::PriceConsumer;
use std::env;

#[tokio::main(flavor = "multi_thread", worker_threads = 2)]
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

    // Start a consumer on the queue using your custom consumer.
    let mut consume_args = BasicConsumeArguments::new(&queue_name, "stock_price_consumer");
    consume_args.manual_ack(false);
    channel
        .basic_consume(PriceConsumer, consume_args)
        .await
        .unwrap();
}
