import { Hono } from "hono";
import orderRoutes from "@/routes/orderManagerRoutes";
import { initializeRabbitMQ } from "./services/rabbitMQService";

const port = Bun.env.PORT || 3000;
const rabbitPort = Bun.env.RABBIT_PORT || 5672;
const rabbitHost = Bun.env.RABBIT_HOST || "localhost";
const rabbitUser = Bun.env.RABBIT_USER || "guest";
const rabbitPassword = Bun.env.RABBIT_PASSWORD || "guest";
const rabbitUrl = `amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}:${rabbitPort}`;
const app = new Hono();

await initializeRabbitMQ(rabbitUrl);

app.route("/", orderRoutes);

Bun.serve({
  fetch: app.fetch,
  port: port,
});

console.log(`Order Service running on port: ${port}`);
