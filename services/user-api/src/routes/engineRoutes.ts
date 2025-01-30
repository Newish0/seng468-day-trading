import { Hono } from "hono";
import engineController from "../controllers/engineController";

const engineRoutes = new Hono();

engineRoutes.post("/placeStockOrder", engineController.placeStockOrder);
engineRoutes.post(
  "/cancelStockTransaction",
  engineController.cancelStockTransaction
);

export default engineRoutes;
