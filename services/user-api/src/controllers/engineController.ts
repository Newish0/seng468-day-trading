import {
  type PlaceLimitSellRequest,
  type PlaceLimitSellResponse,
} from "shared-types/dtos/order/placeLimitSell";
import {
  type PlaceMarketBuyRequest,
  type PlaceMarketBuyResponse,
} from "shared-types/dtos/order/placeMarketBuy";
import type {
  CancelStockTransactionRequest,
  CancelStockTransactionResponse,
} from "shared-types/dtos/user-api/engine/cancelStockTransaction";
import type { PlaceStockOrderRequest } from "shared-types/dtos/user-api/engine/placeStockOrder";
import type { ContextWithUser, WrappedInput } from "shared-types/hono";
import { ORDER_TYPE } from "shared-types/transactions";
import { makeInternalRequest } from "shared-utils/internalCommunication";

const engineController = {
  placeStockOrder: async (
    c: ContextWithUser<WrappedInput<PlaceStockOrderRequest>>
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
  cancelStockTransaction: async (
    c: ContextWithUser<WrappedInput<CancelStockTransactionRequest>>
  ) => {
    const { stock_tx_id } = c.req.valid("json");
    const response = await makeInternalRequest<
      CancelStockTransactionRequest,
      CancelStockTransactionResponse
    >({
      body: { stock_tx_id },
    })("orderService", "cancelStockTransaction");
    if (response.success) {
      return c.json({ success: true, data: null });
    } else {
      return c.json({ success: false, data: null }, 400);
    }
  },
};

export default engineController;
