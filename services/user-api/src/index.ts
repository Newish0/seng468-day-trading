import { Hono } from "hono";
import { jwtAuthorize } from "shared-utils/jwtMiddleware.ts";
import engineRoutes from "./routes/engineRoutes.ts";
import setupRoutes from "./routes/setupRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { getEnvVariable } from "shared-utils/env.ts";

const port = getEnvVariable("USER_API_PORT", "3000");
const app = new Hono();

app.use(jwtAuthorize);

app.route("/transaction", transactionRoutes);
app.route("/engine", engineRoutes);
app.route("/setup", setupRoutes);

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on port ${port}`);
