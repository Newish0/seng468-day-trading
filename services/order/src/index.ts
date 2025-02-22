import { Hono } from "hono";
import orderRoutes from "@/routes/orderRoutes";
import { initializeRabbitMQ } from "./services/rabbitMqService";

const port = Bun.env.PORT || 3000;
const app = new Hono();

app.route("/", orderRoutes);

Bun.serve({
  fetch: app.fetch,
  port: port,
});

initializeRabbitMQ();
console.log(`Order Service running on port: ${port}`);
