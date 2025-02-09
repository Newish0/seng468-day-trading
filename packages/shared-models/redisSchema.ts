import { Schema } from "redis-om";

type InferSchema<T extends Record<string, { type: string }>> = {
  [K in keyof T]: T[K]["type"] extends "string"
    ? string
    : T[K]["type"] extends "string[]"
    ? string[]
    : T[K]["type"] extends "date"
    ? Date
    : T[K]["type"] extends "number"
    ? number
    : T[K]["type"] extends "boolean"
    ? boolean
    : never;
};

const stockSchemaObject = {
  stock_id: { type: "string" },
  stock_name: { type: "string" },
} as const;
const stockSchema = new Schema("stocks", stockSchemaObject);
export type Stock = InferSchema<typeof stockSchemaObject>;

const ownedStockSchemaObject = {
  user_name: { type: "string" },
  stock_id: { type: "string" },
  stock_name: { type: "string" },
  current_quantity: { type: "number" },
} as const;
const ownedStockSchema = new Schema("owned_stocks", ownedStockSchemaObject);
export type StockOwned = InferSchema<typeof ownedStockSchemaObject>;

const walletTransactionSchemaObject = {
  user_name: { type: "string" },
  wallet_tx_id: { type: "string" },
  stock_tx_id: { type: "string" },
  is_debit: { type: "boolean" },
  quantity: { type: "number" },
  time_stamp: { type: "date" },
} as const;
const WalletTransactionSchmea = new Schema("wallet_transactions", walletTransactionSchemaObject);
export type WalletTransaction = InferSchema<typeof walletTransactionSchemaObject>;

const stockTransactionSchemaObject = {
  user_name: { type: "string" },
  stock_tx_id: { type: "string" },
  stock_id: { type: "string" },
  wallet_tx_id: { type: "string" },
  order_status: { type: "string" },
  is_buy: { type: "boolean" },
  order_type: { type: "string" },
  stock_price: { type: "number" },
  quantity: { type: "number" },
  parent_tx_id: { type: "string" },
  time_stamp: { type: "date" },
} as const;
const StockTransactionSchema = new Schema("stock_transactions", stockTransactionSchemaObject);
export type StockTransaction = InferSchema<typeof stockTransactionSchemaObject>;

const userSchemaObject = {
  user_name: { type: "string" },
  password: { type: "string" },
  name: { type: "string" },
  wallet_balence: { type: "number" },
} as const;
const userSchema = new Schema("users", userSchemaObject);
export type User = InferSchema<typeof userSchemaObject>;

export {
  stockSchema,
  ownedStockSchema,
  WalletTransactionSchmea,
  StockTransactionSchema,
  userSchema,
};
