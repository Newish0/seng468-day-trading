import { orderController } from "@/controllers/orderController";
import { Hono } from "hono";

const orderRoutes = new Hono();

// API requests from user-api
// orderRoutes.post("/placeLimitSell", orderController.placeLimitSell);
// orderRoutes.post("/placeMarketBuy", orderController.placeMarketBuy);

// orderRoutes.post("/cancelStockTransaction", orderController.cancelStockTransaction);

export default orderRoutes;
