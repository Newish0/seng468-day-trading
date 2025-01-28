import { isObject } from ".";

export type StockTransaction = {
  stock_tx_id: string;
  stock_id: string;
  wallet_tx_id: string;
  order_status: string;
  is_buy: boolean;
  order_type: string;
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
    typeof obj.order_status === "string" &&
    "is_buy" in obj &&
    typeof obj.is_buy === "boolean" &&
    "order_type" in obj &&
    typeof obj.order_type === "string" &&
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
