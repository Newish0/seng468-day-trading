import { Hono } from "hono";
import controller from "@/controllers/orderController";

const orderRoutes = new Hono();

// API requests from user-api
orderRoutes.post("/placeLimitSell", controller.placeLimitSell);
orderRoutes.post("/placeMarketBuy", controller.placeMarketBuy);

orderRoutes.post("/getStockPrices", controller.getStockPrices);
orderRoutes.post("/cancelStockTransaction", controller.cancelStockTransaction);

// API requests from matching engine
orderRoutes.post("/updateSale", controller.updateSale);

export default orderRoutes;
