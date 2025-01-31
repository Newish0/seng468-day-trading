import type { Context } from "hono";
import userService from "../services/userService";

const stockController = {
  getStockPrices: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
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
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default stockController;
