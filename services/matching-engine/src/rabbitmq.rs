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

use crate::models::{LimitSellCancelResponse, MarketBuyResponse, OrderUpdate, StockPrice};

pub struct RabbitMQConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub shard_id: u32,
}

impl Default for RabbitMQConfig {
    fn default() -> Self {
        Self {
            host: "rabbitmq".to_string(),
            port: 5672,
            username: "guest".to_string(),
            password: "guest".to_string(),
            shard_id: 0,
        }
    }
}

pub struct RabbitMQClient {
    _connection: Connection, // Keep connection alive
    channel: Arc<Channel>,
    config: RabbitMQConfig,
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
            .durable(false)
            .finish();
        channel.exchange_declare(order_exchange_args).await?;

        // Exchange for sending order updates
        let order_update_exchange_args =
            ExchangeDeclareArguments::new("order_update_exchange", "direct")
                .durable(false)
                .finish();
        channel.exchange_declare(order_update_exchange_args).await?;

        // Exchange for stock price updates
        let stock_prices_exchange_args =
            ExchangeDeclareArguments::new("stock_prices_exchange", "topic")
                .durable(false)
                .finish();
        channel.exchange_declare(stock_prices_exchange_args).await?;

        Ok(Self {
            _connection: connection, // Store connection
            channel: Arc::new(channel),
            config,
        })
    }

    pub async fn setup_consumer<C: AsyncConsumer + Clone + Send + 'static>(
        &self,
        consumer: C,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let shard_id = self.config.shard_id;

        // Declare queue for market buy orders specific to this shard
        let market_buy_queue = QueueDeclareArguments::new(&format!(
            "market_buy_queue_shard_{}",
            shard_id
        ));
        let (market_buy_queue_name, _, _) =
            self.channel.queue_declare(market_buy_queue).await?.unwrap();

        // Bind queue with shard-specific routing pattern
        self.channel
            .queue_bind(QueueBindArguments::new(
                &market_buy_queue_name,
                "order_exchange",
                &format!("order.market_buy.shard_{}", shard_id),
            ))
            .await?;

        // Declare queue for limit sell orders specific to this shard
        let limit_sell_queue = QueueDeclareArguments::new(&format!(
            "limit_sell_queue_shard_{}",
            shard_id
        ));
        let (limit_sell_queue_name, _, _) =
            self.channel.queue_declare(limit_sell_queue).await?.unwrap();

        // Bind queue with shard-specific routing pattern
        self.channel
            .queue_bind(QueueBindArguments::new(
                &limit_sell_queue_name,
                "order_exchange",
                &format!("order.limit_sell.shard_{}", shard_id),
            ))
            .await?;

        // Declare queue for sell cancellations specific to this shard
        let cancel_sell_queue = QueueDeclareArguments::new(&format!(
            "cancel_sell_queue_shard_{}",
            shard_id
        ));
        let (cancel_sell_queue_name, _, _) = self
            .channel
            .queue_declare(cancel_sell_queue)
            .await?
            .unwrap();

        // Bind queue with shard-specific routing pattern
        self.channel
            .queue_bind(QueueBindArguments::new(
                &cancel_sell_queue_name,
                "order_exchange",
                &format!("order.limit_sell_cancellation.shard_{}", shard_id),
            ))
            .await?;

        // Set up consumers
        let market_buy_args = BasicConsumeArguments::new(
            &market_buy_queue_name,
            &format!("market_buy_consumer_{}", shard_id),
        )
        .finish();
        self.channel
            .basic_consume(consumer.clone(), market_buy_args)
            .await?;

        let limit_sell_args = BasicConsumeArguments::new(
            &limit_sell_queue_name,
            &format!("limit_sell_consumer_{}", shard_id),
        )
        .finish();
        self.channel
            .basic_consume(consumer.clone(), limit_sell_args)
            .await?;

        let cancel_sell_args = BasicConsumeArguments::new(
            &cancel_sell_queue_name,
            &format!("cancel_sell_consumer_{}", shard_id),
        )
        .finish();
        self.channel
            .basic_consume(consumer, cancel_sell_args)
            .await?;

        Ok(())
    }

    pub async fn publish_stock_price(
        &self,
        payload: StockPrice,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let routing_key = format!("stock.price.{}", payload.stock_id);
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
        payload: &impl serde::Serialize,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let routing_key = format!("order.{}", order_type);
        let args = BasicPublishArguments::new("order_update_exchange", &routing_key)
            .mandatory(true) // Ensure messages are routed
            .finish();

        self.channel
            .basic_publish(
                BasicProperties::default()
                    .with_delivery_mode(2) // Make message persistent
                    .finish(),
                serde_json::to_vec(payload)?,
                args,
            )
            .await?;

        Ok(())
    }
}
