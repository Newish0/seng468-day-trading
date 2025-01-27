import type { Context } from "hono";

const engineController = {
  placeStockOrder: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  cancelStockTransaction: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default engineController;
