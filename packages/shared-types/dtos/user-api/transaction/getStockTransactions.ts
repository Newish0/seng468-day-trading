import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";
import {
  isValidOrderStatus,
  isValidOrderType,
  ORDER_STATUS,
  ORDER_TYPE,
} from "../../../transactions";

export type GetStockTransactionsResponse = ReturnType<
  {
    stock_tx_id: string;
    stock_id: string;
    wallet_tx_id: string;
    order_status: ORDER_STATUS;
    is_buy: boolean;
    order_type: ORDER_TYPE;
    stock_price: number;
    quantity: number;
    parent_tx_id: string;
    time_stamp: string;
  }[]
>;
export function isGetStockTransactionsResponse(obj: any): obj is GetStockTransactionsResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => {
      isObject(item) &&
        "stock_tx_id" in item &&
        typeof item.stock_tx_id === "string" &&
        "stock_id" in item &&
        typeof item.stock_id === "string" &&
        "wallet_tx_id" in item &&
        typeof item.wallet_tx_id === "string" &&
        "order_status" in item &&
        isValidOrderStatus(item.order_status) &&
        "is_buy" in item &&
        typeof item.is_buy === "boolean" &&
        "order_type" in item &&
        isValidOrderType(item.order_type) &&
        "stock_price" in item &&
        typeof item.stock_price === "number" &&
        "quantity" in item &&
        typeof item.quantity === "number" &&
        "parent_tx_id" in item &&
        typeof item.parent_tx_id === "string" &&
        "time_stamp" in item &&
        typeof item.time_stamp === "string";
    })
  );
}
