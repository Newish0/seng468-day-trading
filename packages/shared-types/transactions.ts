import { isObject } from ".";

export type StockTransaction = {
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
};
export function isStockTransaction(obj: any): obj is StockTransaction {
  return (
    isObject(obj) &&
    "stock_tx_id" in obj &&
    typeof obj.stock_tx_id === "string" &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "wallet_tx_id" in obj &&
    typeof obj.wallet_tx_id === "string" &&
    "order_status" in obj &&
    isValidOrderStatus(obj.order_status) &&
    "is_buy" in obj &&
    typeof obj.is_buy === "boolean" &&
    "order_type" in obj &&
    isValidOrderType(obj.order_type) &&
    "stock_price" in obj &&
    typeof obj.stock_price === "number" &&
    "quantity" in obj &&
    typeof obj.quantity === "number" &&
    "parent_tx_id" in obj &&
    typeof obj.parent_tx_id === "string" &&
    "time_stamp" in obj &&
    typeof obj.time_stamp === "string"
  );
}

export type WalletTransaction = {
  wallet_tx_id: string;
  stock_tx_id: string;
  is_debit: boolean;
  amount: number;
  time_stamp: string;
};
export function isWalletTransaction(obj: any): obj is WalletTransaction {
  return (
    isObject(obj) &&
    "wallet_tx_id" in obj &&
    typeof obj.wallet_tx_id === "string" &&
    "stock_tx_id" in obj &&
    typeof obj.stock_tx_id === "string" &&
    "is_debit" in obj &&
    typeof obj.is_debit === "boolean" &&
    "amount" in obj &&
    typeof obj.amount === "number" &&
    "time_stamp" in obj &&
    typeof obj.time_stamp === "string"
  );
}

export enum ORDER_STATUS {
  PENDING = "PENDING",
  PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED",
  COMPLETED = "COMPLETED",
}
export function isValidOrderStatus(obj: any): obj is ORDER_STATUS {
  return (
    obj === ORDER_STATUS.PENDING ||
    obj === ORDER_STATUS.PARTIALLY_COMPLETED ||
    obj === ORDER_STATUS.COMPLETED
  );
}

export enum ORDER_TYPE {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}
export function isValidOrderType(obj: any): obj is ORDER_TYPE {
  return obj === ORDER_TYPE.MARKET || obj === ORDER_TYPE.LIMIT;
}
