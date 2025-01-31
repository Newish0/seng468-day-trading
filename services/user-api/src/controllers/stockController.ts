import type { Context } from "hono";
import stockService from "../services/stockService";
import userService from "../services/userService";

const stockController = {
  getStockPrices: async (c: Context) => {
    try {
      const stocks = await stockService.getAvailableStocks();
      return c.json({ success: true, data: stocks });
    } catch (e) {
      return c.json({ success: false, data: null }, 400);
    }
  },
  getStockPortfolio: async (c: Context) => {
    // const userId = c.get("user");
    const userId = "1234";
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: user.portfolio });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  getStockTransactions: async (c: Context) => {
    // const userId = c.get("user");
    const userId = "1234";
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: user.stockTransactions });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
};

export default stockController;
