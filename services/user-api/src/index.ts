import { Hono } from "hono";
import engineRoutes from "./routes/engineRoutes.ts";
import setupRoutes from "./routes/setupRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const port = process.env.PORT || 3000;
const app = new Hono();

app.route("/transaction", transactionRoutes);
app.route("/engine", engineRoutes);
app.route("/setup", setupRoutes);

Bun.serve({
  fetch: app.fetch,
  port,
});

app.get("/", async (c: any) => {
  c.status(400);
  return c.json({ message: "Not implemented" });
});

console.log(`Server running on port ${port}`);
