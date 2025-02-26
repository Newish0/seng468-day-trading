use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{QueueBindArguments, QueueDeclareArguments},
    connection::{Connection, OpenConnectionArguments},
};

use std::env;

pub async fn setup_rabbitmq() -> (Connection, amqprs::channel::Channel) {
    // Retrieve RabbitMQ configuration
    let host = env::var("RABBITMQ_HOST").unwrap_or_else(|_| "localhost".to_string());
    let port = env::var("RABBITMQ_PORT")
        .unwrap_or_else(|_| "5672".to_string())
        .parse()
        .unwrap_or(5672);
    let username = env::var("RABBITMQ_USERNAME").unwrap_or_else(|_| "guest".to_string());
    let password = env::var("RABBITMQ_PASSWORD").unwrap_or_else(|_| "guest".to_string());

    // Open connection
    let connection = Connection::open(&OpenConnectionArguments::new(
        &host, port, &username, &password,
    ))
    .await
    .unwrap();
    connection
        .register_callback(DefaultConnectionCallback)
        .await
        .unwrap();

    // Open channel
    let channel = connection.open_channel(None).await.unwrap();
    channel
        .register_callback(DefaultChannelCallback)
        .await
        .unwrap();

    // Setup queue and binding
    let exchange_name = "stock_prices_exchange";
    let queue_name = "stock_prices_queue";
    channel
        .queue_declare(QueueDeclareArguments::new(queue_name))
        .await
        .unwrap();

    let binding_key = "stock.price.*";
    channel
        .queue_bind(QueueBindArguments::new(
            queue_name,
            exchange_name,
            binding_key,
        ))
        .await
        .unwrap();

    println!(
        "Connected to exchange '{}', consuming from queue '{}'",
        exchange_name, queue_name
    );

    (connection, channel)
}
