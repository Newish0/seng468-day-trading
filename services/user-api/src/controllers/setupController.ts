import type { Context, Env } from "hono";
import type { CreateStockRequest } from "shared-types/dtos/user-api/setup/createStock";
import type { WrappedInput } from "shared-types/hono";

const setupController = {
  createStock: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<CreateStockRequest>
  >(
    c: Context<E, P, I>
  ) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default setupController;
