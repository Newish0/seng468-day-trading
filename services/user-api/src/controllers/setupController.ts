import type { Context, Env } from "hono";
import type { CreateStockRequest } from "shared-types/dtos/user-api/setup/createStock";
import type { WrappedInput } from "shared-types/hono";
import stockService from "../services/stockService";

const setupController = {
  createStock: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<CreateStockRequest>
  >(
    c: Context<E, P, I>
  ) => {
    const { stock_name } = c.req.valid("json");
    try {
      const stock_id = stockService.createStock(stock_name);
      return c.json({ success: true, data: { stock_id } });
    } catch (e) {
      return c.json({ success: false, data: null }, 400);
    }
  },
};

export default setupController;
