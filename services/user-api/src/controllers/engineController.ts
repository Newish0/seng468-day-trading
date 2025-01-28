import type { Context, Env } from "hono";
import type { CancelStockTransactionRequest } from "shared-types/dtos/user-api/engine/cancelStockTransaction";
import type { PlaceStockOrderRequest } from "shared-types/dtos/user-api/engine/placeStockOrder";
import type { WrappedInput } from "shared-types/hono";

const engineController = {
  placeStockOrder: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<PlaceStockOrderRequest>
  >(
    c: Context<E, P, I>
  ) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  cancelStockTransaction: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<CancelStockTransactionRequest>
  >(
    c: Context<E, P, I>
  ) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default engineController;
