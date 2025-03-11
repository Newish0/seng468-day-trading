import { startOrderUpdateConsumer } from "@/consumers/orderUpdateConsumer";
import logger from "./utils/logger";

const rabbitPort = Bun.env.RABBIT_PORT || 5672;
const rabbitHost = Bun.env.RABBIT_HOST || "localhost";
const rabbitUser = Bun.env.RABBIT_USER || "guest";
const rabbitPassword = Bun.env.RABBIT_PASSWORD || "guest";

const rabbitUrl = `amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}:${rabbitPort}`;

logger.info(`Order Update Service have started.`);

await startOrderUpdateConsumer(rabbitUrl);
