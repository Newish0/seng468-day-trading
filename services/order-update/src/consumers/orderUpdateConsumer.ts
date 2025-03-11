import * as amqp from "amqplib";
import OrderUpdateHandler from "@/handlers/orderUpdateHandler";
import logger from "@/utils/logger";

const DEFAULT_RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "order_update_exchange";
const QUEUE_NAME = "order_update_queue";
const ROUTING_KEYS = ["order.sale_update", "order.buy_completed", "order.cancelled"];

export async function startOrderUpdateConsumer(rabbitMQUrl = DEFAULT_RABBITMQ_URL) {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    // Set up exchange and queue
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: false });
    await channel.assertQueue(QUEUE_NAME, { durable: false });

    // Bind queue to exchange for all routing keys
    for (const routingKey of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, routingKey);
    }

    channel.prefetch(1); // Fair dispatch to allow multiple consumers (Work Queue)

    logger.info("Order Update Service waiting for messages...");

    await channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;

          logger.debug(`Received message with routing key: ${routingKey}`);
          logger.debug(`Message content: ${content}`);

          switch (routingKey) {
            case "order.sale_update":
              await OrderUpdateHandler.handleSaleUpdate(content);
              break;

            case "order.buy_completed":
              await OrderUpdateHandler.handleBuyCompletion(content);
              break;

            case "order.cancelled":
              await OrderUpdateHandler.handleCancellation(content);
              break;

            default:
              logger.warn(`Unknown routing key: ${routingKey}`);
              channel.nack(msg); // Reject invalid messages
              return;
          }

          channel.ack(msg);
        } catch (error) {
          logger.error("Message processing failed:", error);
          channel.nack(msg, false, false); // Dead-letter handling
        }
      },
      { noAck: false }
    );

    // Graceful shutdown
    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Order Update Service failed to start:", error);
    process.exit(1);
  }
}
