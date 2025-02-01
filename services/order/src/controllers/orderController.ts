import service from "../services/orderService";
import type { Context } from "hono";

const controller = {
  placeLimitSell: async (c: Context) => {
    const { stock_id, quantity, price } = await c.req.json();
    const user_name = c.get("user")
    if(!stock_id || !quantity || !price || !user_name){
      return c.json({ success: false, data: { error: "Missing required parameters" } }, 400);
    }

    try {
      await service.placeLimitSellOrder(stock_id, quantity, price, user_name);
      return c.json({ success: true, data: null }, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      }
      return c.json({ success: false, data: { error: "An unknown error has occurred with limit sell" } }, 500);
    }

  },

  placeMarketBuy: async (c: Context) => {
    const { stock_id, quantity } = await c.req.json();
    const user = c.get("user")
    try {
      await service.placeMarketBuyOrder(stock_id, quantity, user.user_name);
      return c.json({ success: true, data: null }, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      }
      return c.json({ success: false, data: { error: "An unknown error has occurred with market buy" } }, 500);
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
    const { stock_id, quantity, price, stock_tx_id, user_name } = await c.req.json();

    try {
      await service.partialSell(stock_id, quantity, price, stock_tx_id, user_name);
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
