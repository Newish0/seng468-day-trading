import * as amqp from "amqplib";
import OrderUpdateHandler from "@/handlers/orderUpdateHandler";
import logger from "@/utils/logger";

const DEFAULT_RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "order_update_exchange";
const QUEUE_NAME = "order_update_queue";
const ROUTING_KEYS = ["order.sale_update", "order.buy_completed", "order.cancelled"];

// Performance tracking
const processingTimes: number[] = [];
let totalProcessingTime = 0;
let messageCount = 0;

// Throughput tracking
const recentMessageTimes: number[] = [];
const THROUGHPUT_WINDOW_MS = 2000; // 2 seconds

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

    // channel.prefetch(1); // Fair dispatch to allow multiple consumers (Work Queue)

    logger.info("Order Update Service waiting for messages...");

    await channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        const startTime = performance.now();
        
        // Add to recent messages for throughput calculation
        const currentTime = Date.now();
        recentMessageTimes.push(currentTime);
        
        // Remove messages older than the throughput window
        while (
          recentMessageTimes.length > 0 && 
          recentMessageTimes[0] < currentTime - THROUGHPUT_WINDOW_MS
        ) {
          recentMessageTimes.shift();
        }
        
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
          
          // Calculate and log processing time
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          processingTimes.push(processingTime);
          
          totalProcessingTime += processingTime;
          messageCount++;
          
          // // Calculate performance stats
          // const avgTime = totalProcessingTime / messageCount;
          // const minTime = Math.min(...processingTimes);
          // const maxTime = Math.max(...processingTimes);
          
          // // Calculate throughput (messages per second over the last THROUGHPUT_WINDOW_MS)
          // const throughput = (recentMessageTimes.length / THROUGHPUT_WINDOW_MS) * 1000;
          
          // logger.info(
          //   `Message processed in ${processingTime.toFixed(2)}ms | ` +
          //   `Avg: ${avgTime.toFixed(2)}ms | Min: ${minTime.toFixed(2)}ms | ` +
          //   `Max: ${maxTime.toFixed(2)}ms | Throughput: ${throughput.toFixed(2)} msg/sec | ` +
          //   `Total messages: ${messageCount}`
          // );
          
        } catch (error) {
          // Calculate processing time even for failed messages
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          
          logger.error(`Message processing failed after ${processingTime.toFixed(2)}ms:`, error);
          channel.nack(msg, false, false); // Dead-letter handling
        }
      },
      { noAck: false }
    );

    // Periodically log performance and throughput statistics (every minute)
    setInterval(() => {
      if (messageCount > 0) {
        const avgTime = totalProcessingTime / messageCount;
        const minTime = Math.min(...processingTimes);
        const maxTime = Math.max(...processingTimes);
        
        // Calculate current throughput
        const currentTime = Date.now();
        const recentMessages = recentMessageTimes.filter(
          time => time >= currentTime - THROUGHPUT_WINDOW_MS
        );
        const throughput = (recentMessages.length / THROUGHPUT_WINDOW_MS) * 1000;
        
        logger.info(
          `Performance statistics: Total messages: ${messageCount} | ` +
          `Avg time: ${avgTime.toFixed(2)}ms | Min time: ${minTime.toFixed(2)}ms | ` +
          `Max time: ${maxTime.toFixed(2)}ms | Current throughput: ${throughput.toFixed(2)} msg/sec`
        );
      }
    }, 1 * 1000);

    // Graceful shutdown
    process.once("SIGINT", async () => {
      // Log final statistics before shutting down
      if (messageCount > 0) {
        const avgTime = totalProcessingTime / messageCount;
        const minTime = Math.min(...processingTimes);
        const maxTime = Math.max(...processingTimes);
        
        // Calculate final throughput
        const currentTime = Date.now();
        const recentMessages = recentMessageTimes.filter(
          time => time >= currentTime - THROUGHPUT_WINDOW_MS
        );
        const throughput = (recentMessages.length / THROUGHPUT_WINDOW_MS) * 1000;
        
        logger.info(
          `Final performance statistics: Total messages: ${messageCount} | ` +
          `Avg time: ${avgTime.toFixed(2)}ms | Min time: ${minTime.toFixed(2)}ms | ` +
          `Max time: ${maxTime.toFixed(2)}ms | Final throughput: ${throughput.toFixed(2)} msg/sec`
        );
      }
      
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Order Update Service failed to start:", error);
    process.exit(1);
  }
}