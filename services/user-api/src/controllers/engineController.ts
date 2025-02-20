import type { ContentfulStatusCode } from "hono/utils/http-status";
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
import { handleError } from "shared-utils";
import { makeInternalRequest } from "shared-utils/internalCommunication";

const engineController = {
  placeStockOrder: async (c: ContextWithUser<WrappedInput<PlaceStockOrderRequest>>) => {
    const { username: user_name } = c.get("user");
    const { stock_id, is_buy: isBuy, order_type: orderType, quantity, price } = c.req.valid("json");
    if (isBuy) {
      if (orderType !== ORDER_TYPE.MARKET) {
        return handleError(
          c,
          new Error("Only market buy orders are supported"),
          "Invalid order type",
          400
        );
      }
      const response = await makeInternalRequest<PlaceMarketBuyRequest, PlaceMarketBuyResponse>({
        body: {
          stock_id,
          quantity,
          user_name,
        },
      })("orderService", "placeMarketBuy");
      if (response.success) {
        return c.json({ success: true, data: null });
      } else {
        return handleError(
          c,
          new Error("Failed to place order"),
          "Failed to place order",
          response.status == 400 ? 400 : 500
        );
      }
    } else {
      if (orderType !== ORDER_TYPE.LIMIT) {
        return handleError(
          c,
          new Error("Only limit sell orders are supported"),
          "Invalid order type",
          400
        );
      }
      const response = await makeInternalRequest<PlaceLimitSellRequest, PlaceLimitSellResponse>({
        body: {
          stock_id,
          quantity,
          price,
          user_name,
        },
      })("orderService", "placeLimitSell");
      if (response.success) {
        return c.json({ success: true, data: null });
      } else {
        return handleError(
          c,
          new Error("Failed to place order"),
          "Failed to place order",
          response.status == 400 ? 400 : 500
        );
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
      body: { stock_tx_id, user_name: c.get("user").username },
    })("orderService", "cancelStockTransaction");

    if (response.success) {
      return c.json({ success: true, data: null });
    } else {
      return handleError(
        c,
        new Error("Failed to cancel order"),
        "Failed to cancel order",
        response.status == 400 ? 400 : 500
      );
    }
  },
};

export default engineController;
