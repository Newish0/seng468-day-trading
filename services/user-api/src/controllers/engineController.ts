import type { Context, Env } from "hono";
import {
  type PlaceLimitSellRequest,
  type PlaceLimitSellResponse,
} from "shared-types/dtos/order/placeLimitSell";
import {
  type PlaceMarketBuyRequest,
  type PlaceMarketBuyResponse,
} from "shared-types/dtos/order/placeMarketBuy";
import type { CancelStockTransactionRequest } from "shared-types/dtos/user-api/engine/cancelStockTransaction";
import type { PlaceStockOrderRequest } from "shared-types/dtos/user-api/engine/placeStockOrder";
import type { WrappedInput } from "shared-types/hono";
import { ORDER_TYPE } from "shared-types/transactions";
import { makeInternalRequest } from "shared-utils/internalCommunication";

const engineController = {
  placeStockOrder: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<PlaceStockOrderRequest>
  >(
    c: Context<E, P, I>
  ) => {
    const {
      stock_id,
      is_buy: isBuy,
      order_type: orderType,
      quantity,
      price,
    } = c.req.valid("json");
    if (isBuy) {
      if (orderType !== ORDER_TYPE.MARKET) {
        return c.json({ success: false, data: null }, 422);
      }
      const response = await makeInternalRequest<
        PlaceLimitSellRequest,
        PlaceLimitSellResponse
      >({
        body: {
          stock_id,
          quantity,
          price,
        },
      })("orderService", "placeLimitSell");
      if (response.success) {
        return c.json({ success: true, data: null });
      } else {
        return c.json({ success: false, data: null }, 400);
      }
    } else {
      if (orderType !== ORDER_TYPE.LIMIT) {
        return c.json({ success: false, data: null }, 422);
      }
      const response = await makeInternalRequest<
        PlaceMarketBuyRequest,
        PlaceMarketBuyResponse
      >({
        body: {
          stock_id,
          quantity,
        },
      })("orderService", "placeMarketBuy");
      if (response.success) {
        return c.json({ success: true, data: null });
      } else {
        return c.json({ success: false, data: null }, 400);
      }
    }
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
