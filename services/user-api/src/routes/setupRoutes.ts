import { Hono } from "hono";
import { isCreateStockRequest } from "shared-types/dtos/user-api/setup/createStock";
import { getValidator } from "shared-utils";
import setupController from "../controllers/setupController";

const setupRoutes = new Hono();

setupRoutes.post(
  "/createStock",
  getValidator(isCreateStockRequest),
  setupController.createStock
);

export default setupRoutes;
