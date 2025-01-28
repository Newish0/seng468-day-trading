import service from "../services/orderService";
import type { Context } from "hono";

const controller = {
  placeStockOrder: async (c: Context) => {
    const { stock_id, is_buy, order_type, quantity, price } = await c.req.json();

    if (!stock_id || is_buy === undefined || is_buy === null || !order_type || !quantity || (order_type !== "LIMIT" && order_type !== "MARKET")) {
      return c.json({ success: false, data: { error: "Missing required parameters" } }, 400);
    }

    if (order_type === "LIMIT" && is_buy === false && (price === undefined || price === null)) {
      return c.json({ success: false, data: { error: "Price is required for SELL orders with LIMIT type" } }, 400);
    }

    try {
      await service.placeStockOrder(stock_id, is_buy, order_type, quantity, price);
      return c.json({ success: true, data: null }, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      }
      return c.json({ success: false, data: { error: "An unknown error has occurred" } }, 500);
    }
  },

  getStockPrices: async (c: Context) => {
    try {
      const response = await service.getStockPrices();
      if (!response.ok) {
        throw new Error("Failed to fetch stock prices");
      }
      // REVIEW: lexiographic ordering of stocks?
      const data = await response.json(); 
      return c.json({ success: true, data }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      }
      return c.json({ success: false, data: { error: "An unknown error has occurred" } }, 500);
    }
  },

  cancelStockTransaction: async (c: Context) => {
    const { stock_tx_id } = await c.req.json();

    if (!stock_tx_id) {
      return c.json({ success: false, data: { error: "Missing stock_tx_id" } }, 400);
    }

    try {
      await service.cancelStockTransaction(stock_tx_id);
      return c.json({ success: true, data: null }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      }
      return c.json({ success: false, data: { error: "An unknown error has occurred" } }, 500);
    }
  },

  // Handle partial sell updates sent by the Matching Engine
  partialSell: async (c: Context) => {
    const { stock_id, quantity, price, stock_tx_id } = await c.req.json();

    try {
      await service.partialSell(stock_id, quantity, price, stock_tx_id);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ success: false, data: { error: "Dummy error message" } }, 500);
    }
  },

  //  Handle complete sell updates sent by the Matching Engine
  completeSell: async (c: Context) => {
    const { stock_id, quantity, price, stock_tx_id } = await c.req.json();

    try {
      await service.completeSell(stock_id, quantity, price, stock_tx_id);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ success: false, data: { error: "Dummy error message" } }, 500);
    }
  },
};
export default controller;
