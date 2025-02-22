import amqp from "amqplib";

const ORDER_EXCHANGE = "order_exchange";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let channel: amqp.Channel;

/**
 * Initializes the RabbitMQ connection and creates a channel.
 * It also asserts the exchange (order_exchange) of type "topic" to ensure it exists.
 */
export async function initializeRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: false }); // REVIEW: Do we need durable?
  } catch (error) {
    throw error;
  }
}

/**
 * Publishes a message to the specified exchange with a given routing key.
 * The message is serialized into a JSON buffer before being sent to the exchange.
 */
export async function publishToQueue(routingKey: string, message: any) {
  try {
    await channel.publish(ORDER_EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
  } catch (error) {
    throw error;
  }
}
