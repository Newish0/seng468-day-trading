import { Hono } from "hono";
import authRoutes from "./routes/authRoutes";

const port = process.env.PORT || 3000;
const app = new Hono();

app.route("/authentication", authRoutes);

Bun.serve({
  fetch: app.fetch,
  port: port,
});

console.log(`Server running on port: ${port}`);
