import amqp from "amqplib";

const ORDER_EXCHANGE = "order_exchange";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let channel: amqp.Channel;

export async function initializeRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: true });
  } catch (error) {
    console.error("Failed to initialize RabbitMQ:", error);
    throw error;
  }
}

export async function publishToQueue(routingKey: string, message: any) {
  try {
    await channel.publish(ORDER_EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
  } catch (error) {
    console.error("Failed to publish message:", error);
    throw error;
  }
}
