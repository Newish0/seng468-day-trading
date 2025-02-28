import controller from "@/controllers/orderController";
import { Hono } from "hono";

const orderRoutes = new Hono();

// API requests from user-api
orderRoutes.post("/placeLimitSell", controller.placeLimitSell);
orderRoutes.post("/placeMarketBuy", controller.placeMarketBuy);

orderRoutes.get("/getStockPrices", controller.getStockPrices);
orderRoutes.post("/cancelStockTransaction", controller.cancelStockTransaction);

// API requests from matching engine
orderRoutes.post("/updateSale", controller.updateSale);

export default orderRoutes;
