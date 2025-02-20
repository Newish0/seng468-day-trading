use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{
        BasicConsumeArguments, BasicPublishArguments, Channel, ExchangeDeclareArguments,
        QueueBindArguments, QueueDeclareArguments,
    },
    connection::{Connection, OpenConnectionArguments},
    consumer::AsyncConsumer,
    BasicProperties,
};
use std::sync::Arc;

use crate::models::{LimitSellCancelResponse, MarketBuyResponse, OrderUpdate};

pub struct RabbitMQConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

impl Default for RabbitMQConfig {
    fn default() -> Self {
        Self {
            host: "rabbitmq".to_string(),
            port: 5672,
            username: "guest".to_string(),
            password: "guest".to_string(),
        }
    }
}

pub struct RabbitMQClient {
    _connection: Connection,  // Keep connection alive
    channel: Arc<Channel>,
}

impl RabbitMQClient {
    pub async fn new(config: RabbitMQConfig) -> Result<Self, Box<dyn std::error::Error>> {
        // Open connection
        let connection = Connection::open(&OpenConnectionArguments::new(
            &config.host,
            config.port,
            &config.username,
            &config.password,
        ))
        .await?;

        // Register connection callbacks
        connection
            .register_callback(DefaultConnectionCallback)
            .await?;

        // Open a channel
        let channel = connection.open_channel(None).await?;

        // Register channel callbacks
        channel.register_callback(DefaultChannelCallback).await?;

        // Declare exchanges
        // Exchange for receiving orders
        let order_exchange_args = ExchangeDeclareArguments::new("order_exchange", "topic")
            .durable(true)
            .finish();
        channel.exchange_declare(order_exchange_args).await?;

        // Exchange for sending order updates
        let order_update_exchange_args =
            ExchangeDeclareArguments::new("order_update_exchange", "topic") // HACK: reconsider exchange type
                .durable(true)
                .finish();
        channel.exchange_declare(order_update_exchange_args).await?;

        // Exchange for stock price updates
        let stock_prices_exchange_args =
            ExchangeDeclareArguments::new("stock_prices_exchange", "topic")
                .durable(true)
                .finish();
        channel.exchange_declare(stock_prices_exchange_args).await?;

        Ok(Self {
            _connection: connection,  // Store connection
            channel: Arc::new(channel),
        })
    }

    pub async fn setup_consumer<C: AsyncConsumer + Clone + Send + 'static>(
        &self,
        consumer: C,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // Declare queues for different order types
        let market_buy_queue = QueueDeclareArguments::durable_client_named("market_buy_queue");
        let (market_buy_queue_name, _, _) =
            self.channel.queue_declare(market_buy_queue).await?.unwrap();
        self.channel
            .queue_bind(QueueBindArguments::new(
                &market_buy_queue_name,
                "order_exchange",
                "order.market_buy",
            ))
            .await?;

        let limit_sell_queue = QueueDeclareArguments::durable_client_named("limit_sell_queue");
        let (limit_sell_queue_name, _, _) =
            self.channel.queue_declare(limit_sell_queue).await?.unwrap();
        self.channel
            .queue_bind(QueueBindArguments::new(
                &limit_sell_queue_name,
                "order_exchange",
                "order.limit_sell",
            ))
            .await?;

        let cancel_sell_queue = QueueDeclareArguments::durable_client_named("cancel_sell_queue");
        let (cancel_sell_queue_name, _, _) = self
            .channel
            .queue_declare(cancel_sell_queue)
            .await?
            .unwrap();
        self.channel
            .queue_bind(QueueBindArguments::new(
                &cancel_sell_queue_name,
                "order_exchange",
                "order.limit_sell_cancellation",
            ))
            .await?;

        // Set up consumers
        let market_buy_args =
            BasicConsumeArguments::new(&market_buy_queue_name, "market_buy_consumer").finish();
        self.channel
            .basic_consume(consumer.clone(), market_buy_args)
            .await?;

        let limit_sell_args =
            BasicConsumeArguments::new(&limit_sell_queue_name, "limit_sell_consumer").finish();
        self.channel
            .basic_consume(consumer.clone(), limit_sell_args)
            .await?;

        let cancel_sell_args =
            BasicConsumeArguments::new(&cancel_sell_queue_name, "cancel_sell_consumer").finish();
        self.channel
            .basic_consume(consumer, cancel_sell_args)
            .await?;

        Ok(())
    }

    pub async fn publish_stock_price(
        &self,
        stock_id: &str,
        current_price: f64,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let payload = serde_json::json!({
            "stock_id": stock_id,
            "current_price": current_price,
        });

        let routing_key = format!("stock.price.{}", stock_id);
        let args = BasicPublishArguments::new("stock_prices_exchange", &routing_key);

        self.channel
            .basic_publish(
                BasicProperties::default(),
                serde_json::to_vec(&payload)?,
                args,
            )
            .await?;

        Ok(())
    }

    pub async fn publish_order_cancelled(
        &self,
        payload: &LimitSellCancelResponse,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.publish_order_update("cancelled", &serde_json::to_value(&payload).unwrap())
            .await
    }

    pub async fn publish_buy_completed(
        &self,
        payload: &MarketBuyResponse,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.publish_order_update("buy_completed", &serde_json::to_value(&payload).unwrap())
            .await
    }

    pub async fn publish_sale_update(
        &self,
        payload: &OrderUpdate,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.publish_order_update("sale_update", &serde_json::to_value(&payload).unwrap())
            .await
    }

    async fn publish_order_update(
        &self,
        order_type: &str,
        payload: &serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let routing_key = format!("order.{}", order_type);
        let args = BasicPublishArguments::new("order_update_exchange", &routing_key);

        self.channel
            .basic_publish(
                BasicProperties::default(),
                serde_json::to_vec(payload)?,
                args,
            )
            .await?;

        Ok(())
    }
}
