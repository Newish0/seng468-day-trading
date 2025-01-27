import type { Context } from "hono";

const stockController = {
  getStockPrices: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  getStockPortfolio: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  getStockTransactions: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default stockController;
