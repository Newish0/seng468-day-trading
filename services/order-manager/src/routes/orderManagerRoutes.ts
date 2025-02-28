import controller from "@/controllers/orderManagerController";
import { Hono } from "hono";

const orderRoutes = new Hono();

// API requests from user-api
orderRoutes.post("/placeLimitSell", controller.placeLimitSell);
orderRoutes.post("/placeMarketBuy", controller.placeMarketBuy);
orderRoutes.post("/cancelStockTransaction", controller.cancelStockTransaction);

export default orderRoutes;
