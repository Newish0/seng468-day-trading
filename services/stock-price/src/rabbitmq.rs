use tracing::{debug, error, info};
use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{QueueBindArguments, QueueDeclareArguments},
    connection::{Connection, OpenConnectionArguments},
};

use std::env;

pub async fn setup_rabbitmq(
    exchange_name: &str,
    queue_name: &str,
    binding_key: &str,
) -> (Connection, amqprs::channel::Channel) {
    // Retrieve RabbitMQ configuration
    let host = env::var("RABBITMQ_HOST").unwrap_or_else(|_| "localhost".to_string());
    let port = env::var("RABBITMQ_PORT")
        .unwrap_or_else(|_| "5672".to_string())
        .parse()
        .unwrap_or(5672);
    let username = env::var("RABBITMQ_USERNAME").unwrap_or_else(|_| "guest".to_string());
    let password = env::var("RABBITMQ_PASSWORD").unwrap_or_else(|_| "guest".to_string());

    // Open connection
    info!("Connecting to RabbitMQ at {}:{}", host, port);
    let connection = match Connection::open(&OpenConnectionArguments::new(
        &host, port, &username, &password,
    ))
    .await {
        Ok(conn) => {
            debug!("Successfully established RabbitMQ connection");
            conn
        }
        Err(e) => {
            error!("Failed to connect to RabbitMQ: {}", e);
            panic!("Failed to connect to RabbitMQ: {}", e);
        }
    };
    connection
        .register_callback(DefaultConnectionCallback)
        .await
        .unwrap();

    // Open channel
    debug!("Opening RabbitMQ channel");
    let channel = match connection.open_channel(None).await {
        Ok(ch) => {
            debug!("Successfully opened RabbitMQ channel");
            ch
        }
        Err(e) => {
            error!("Failed to open RabbitMQ channel: {}", e);
            panic!("Failed to open RabbitMQ channel: {}", e);
        }
    };
    channel
        .register_callback(DefaultChannelCallback)
        .await
        .unwrap();

    // Setup queue and binding
    channel
        .queue_declare(QueueDeclareArguments::new(queue_name))
        .await
        .unwrap();

    channel
        .queue_bind(QueueBindArguments::new(
            queue_name,
            exchange_name,
            binding_key,
        ))
        .await
        .unwrap();

    info!(
        "Successfully connected to exchange '{}', consuming from queue '{}'",
        exchange_name, queue_name
    );

    (connection, channel)
}
