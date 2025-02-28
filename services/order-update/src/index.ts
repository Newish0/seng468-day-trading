import { startOrderUpdateConsumer } from "@/consumers/orderUpdateConsumer";

const rabbitPort = Bun.env.RABBIT_PORT || 5672;
const rabbitHost = Bun.env.RABBIT_HOST || "localhost";
const rabbitUser = Bun.env.RABBIT_USER || "guest";
const rabbitPassword = Bun.env.RABBIT_PASSWORD || "guest";

const rabbitUrl = `amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}:${rabbitPort}`;

console.log(`Order Update Service have started.`);

await startOrderUpdateConsumer(rabbitUrl);
