import type { CreateStockRequest } from "shared-types/dtos/user-api/setup/createStock";
import type { ContextWithUser, WrappedInput } from "shared-types/hono";
import { handleError } from "shared-utils";
import stockService from "../services/stockService";

const setupController = {
  createStock: async (c: ContextWithUser<WrappedInput<CreateStockRequest>>) => {
    const { stock_name } = c.req.valid("json");
    try {
      const stock_id = await stockService.createStock(stock_name);
      return c.json({ success: true, data: { stock_id } });
    } catch (e) {
      return handleError(c, e, "Failed to create stock", 400);
    }
  },
};

export default setupController;
