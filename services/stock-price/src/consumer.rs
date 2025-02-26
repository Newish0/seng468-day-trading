use amqprs::{BasicProperties, Deliver, channel::Channel, consumer::AsyncConsumer};
use async_trait::async_trait;

pub struct PriceConsumer;

#[async_trait]
impl AsyncConsumer for PriceConsumer {
    async fn consume(
        &mut self,
        channel: &Channel,
        deliver: Deliver,
        _: BasicProperties,
        content: Vec<u8>,
    ) {
        // Implement your message processing logic here.
        println!("Received message: {:?}", String::from_utf8_lossy(&content));

        // After processing, acknowledge the message.
        if let Err(e) = channel
            .basic_ack(amqprs::channel::BasicAckArguments::new(
                deliver.delivery_tag(),
                false,
            ))
            .await
        {
            eprintln!("Failed to acknowledge message: {}", e);
        }
    }
}
