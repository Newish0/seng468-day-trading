import type { CreateStockRequest } from "shared-types/dtos/user-api/setup/createStock";
import type { AddStockToUserRequest } from "shared-types/dtos/user-api/setup/addStockToUser";
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
      return handleError(c, e, "Failed to create stock", 500);
    }
  },
  addStockToUserRequest: async (c: ContextWithUser<WrappedInput<AddStockToUserRequest>>) => {
    const { stock_id, quantity } = c.req.valid("json");
    const { username } = c.get("user");

    try {
      await stockService.addStockToUser(username, stock_id, quantity);
      return c.json({ success: true, data: null });
    } catch (e) {
      return handleError(c, e, "Failed to add stock to user", 500);
    }
  },
};

export default setupController;
