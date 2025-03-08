import amqp from "amqplib";

const ORDER_EXCHANGE = "order_exchange";
const ME_INSTANCES = parseInt(Bun.env.ME_INSTANCES || "4");

let channel: amqp.Channel;

/**
 * Initializes the RabbitMQ connection and creates a channel.
 * It also asserts the exchange (order_exchange) of type "topic" to ensure it exists.
 */
export async function initializeRabbitMQ(RABBITMQ_URL: string) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: false });
  } catch (error) {
    throw error;
  }
}

/**
 * Generates hash given stockID and number of ME instances
 */
function hashToShard(stockId: string): number {
  let hash = 0;
  for (let i = 0; i < stockId.length; i++) {
    const char = stockId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % ME_INSTANCES;
}

/**
 * Generates and returns routing key from orderType and stockID
 */
function generateRoutingKey(orderType: string, stockId: string): string {
  const shardId = hashToShard(stockId);
  return `${orderType}.shard_${shardId}`;
}

/**
 * Generates routing key by creating a shard given the orderType and the stockID
 * Publishes a message to the specified exchange with a given routing key.
 * The message is serialized into a JSON buffer before being sent to the exchange.
 */
export async function publishToQueue(orderType: string, message: any) {
  try {
    const routingKey = generateRoutingKey(orderType, message.stock_id);
    await channel.publish(ORDER_EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
  } catch (error) {
    throw error;
  }
}
