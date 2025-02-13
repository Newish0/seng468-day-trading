import { Hono } from "hono";
import { isCreateStockRequest } from "shared-types/dtos/user-api/setup/createStock";
import { isAddStockToUserRequest } from "shared-types/dtos/user-api/setup/addStockToUser";
import { getValidator } from "shared-utils";
import setupController from "../controllers/setupController";

const setupRoutes = new Hono();

setupRoutes.post("/createStock", getValidator(isCreateStockRequest), setupController.createStock);

setupRoutes.post(
  "/addStockToUser",
  getValidator(isAddStockToUserRequest),
  setupController.addStockToUserRequest
);

export default setupRoutes;
