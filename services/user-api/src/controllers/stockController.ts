import {
  type GetStockPricesRequest,
  type GetStockPricesResponse,
} from "shared-types/dtos/order/getStockPrices";
import type { ContextWithUser } from "shared-types/hono";
import { makeInternalRequest } from "shared-utils/internalCommunication";
import userService from "../services/userService";

const stockController = {
  getStockPrices: async (c: ContextWithUser) => {
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
  getStockPortfolio: async (c: ContextWithUser) => {
    const userId = c.get("user");
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: user.portfolio });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  getStockTransactions: async (c: ContextWithUser) => {
    const userId = c.get("user");
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: user.stockTransactions });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
};

export default stockController;
