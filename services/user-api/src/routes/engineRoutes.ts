import { Hono } from "hono";
import { isCancelStockTransactionRequest } from "shared-types/dtos/user-api/engine/cancelStockTransaction";
import { isPlaceStockOrderRequest } from "shared-types/dtos/user-api/engine/placeStockOrder";
import { getValidator } from "shared-utils";
import engineController from "../controllers/engineController";

const engineRoutes = new Hono();

engineRoutes.post(
  "/placeStockOrder",
  getValidator(isPlaceStockOrderRequest),
  engineController.placeStockOrder
);
engineRoutes.post(
  "/cancelStockTransaction",
  getValidator(isCancelStockTransactionRequest),
  engineController.cancelStockTransaction
);

export default engineRoutes;
