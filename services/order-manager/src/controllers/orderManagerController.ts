import service from "@/services/orderManagerService";
import type { Context } from "hono";
import { handleError } from "shared-utils";

const controller = {
  placeLimitSell: async (c: Context) => {
    const { stock_id, quantity, price, user_name } = await c.req.json();

    if (!stock_id || !quantity || !price || !user_name) {
      return handleError(
        c,
        new Error("Invalid request body: Missing required parameters for limit sell"),
        "Missing required parameters for limit sell",
        400
      );
    }

    try {
      await service.placeLimitSellOrder(stock_id, quantity, price, user_name);
      return c.json({ success: true, data: null }, 201);
    } catch (error) {
      return handleError(c, error, "An unknown error has occurred with limit sell");
    }
  },

  placeMarketBuy: async (c: Context) => {
    const { stock_id, quantity, user_name } = await c.req.json();

    try {
      const stockTxId = await service.placeMarketBuyOrder(stock_id, quantity, user_name);

      await service.waitForBuyCompletion(stockTxId);

      return c.json({ success: true, data: null }, 201);
    } catch (error) {
      return handleError(c, error, "An unknown error has occurred with market buy");
    }
  },

  cancelStockTransaction: async (c: Context) => {
    const { stock_tx_id, user_name } = await c.req.json();

    if (!stock_tx_id) {
      return handleError(
        c,
        new Error("Invalid request body: Missing stock_tx_id"),
        "Missing stock_tx_id",
        400
      );
    }

    try {
      await service.cancelStockTransaction(stock_tx_id, user_name);
      return c.json({ success: true, data: null }, 200);
    } catch (error) {
      return handleError(c, error, "An unknown error has occurred while cancelling transaction");
    }
  },
};
export default controller;
