import { Hono } from "hono";
import userApiRoutes from "./routes/userApiRoutes.ts";

const port = Bun.env.PORT || 3000;
const app = new Hono();

app.route("/", userApiRoutes);

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on port ${port}`);
