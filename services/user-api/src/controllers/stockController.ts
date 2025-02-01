import type { Context } from "hono";
import {
  type GetStockPricesRequest,
  type GetStockPricesResponse,
} from "shared-types/dtos/order/getStockPrices";
import { makeInternalRequest } from "shared-utils/internalCommunication";
import userService from "../services/userService";

const stockController = {
  getStockPrices: async (c: Context) => {
    try {
      const response = await makeInternalRequest<
        GetStockPricesRequest,
        GetStockPricesResponse
      >({ body: undefined })("orderService", "getStockPrices");
      if (!response.success) {
        return c.json({ success: false, data: null }, 400);
      }
      return c.json({ success: true, data: response.data });
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
