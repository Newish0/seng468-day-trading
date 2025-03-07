import * as amqp from "amqplib";
import OrderUpdateHandler from "@/handlers/orderUpdateHandler";
import logger from "@/utils/logger";

const DEFAULT_RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "order_update_exchange";
const QUEUE_NAME = "order_update_queue";
const ROUTING_KEYS = ["order.sale_update", "order.buy_completed", "order.cancelled"];
const DEFAULT_MAX_CONCURRENT_MSG = 100;

export async function startOrderUpdateConsumer(
  rabbitMQUrl = DEFAULT_RABBITMQ_URL,
  maxConcurrentMsg = DEFAULT_MAX_CONCURRENT_MSG
) {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    // Set up exchange and queue
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Bind queue to exchange for all routing keys
    for (const routingKey of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, routingKey);
    }

    // Allow prefetch > 1 to allow more messages to be processed concurrently
    channel.prefetch(maxConcurrentMsg);

    // Track in-flight promises to limit concurrency
    const inFlightPromises = new Set();

    logger.info(
      `Order Update Service waiting for messages (max concurrent: ${maxConcurrentMsg})...`
    );

    await channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (!msg) return;

        // Function to process one message
        const processMessage = async () => {
          try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            logger.debug(`Processing message with routing key: ${routingKey}`);

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
                channel.nack(msg, false, false); // Reject invalid messages
                return;
            }

            channel.ack(msg);
            logger.debug(`Successfully processed message with routing key: ${routingKey}`);
          } catch (error) {
            logger.error("Message processing failed:", error);
            channel.nack(msg, false, false); // Dead-letter handling
          } finally {
            // Remove this promise from the tracking set when done
            inFlightPromises.delete(processingPromise);
          }
        };

        const processingPromise = processMessage();
        inFlightPromises.add(processingPromise);
      },
      { noAck: false }
    );

    // Graceful shutdown handling with proper cleanup
    process.once("SIGINT", async () => {
      logger.info("Shutting down Order Update Service...");

      // Wait for in-flight messages to complete processing
      if (inFlightPromises.size > 0) {
        logger.info(`Waiting for ${inFlightPromises.size} in-flight messages to complete...`);
        await Promise.allSettled(inFlightPromises);
      }

      await channel.close();
      await connection.close();
      logger.info("Order Update Service shutdown complete");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Order Update Service failed to start:", error);
    process.exit(1);
  }
}
