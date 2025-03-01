import { Schema, type Entity } from "redis-om";

type InferSchema<T extends Record<string, { type: string }>> = Entity & {
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

export type Stock = InferSchema<typeof stockSchemaObject>;
const stockSchema = new Schema<Stock>("stocks", stockSchemaObject);

const ownedStockSchemaObject = {
  user_name: { type: "string" },
  stock_id: { type: "string" },
  stock_name: { type: "string" },
  current_quantity: { type: "number" },
} as const;

export type StockOwned = InferSchema<typeof ownedStockSchemaObject>;
const ownedStockSchema = new Schema<StockOwned>("owned_stocks", ownedStockSchemaObject);

const walletTransactionSchemaObject = {
  user_name: { type: "string" },
  wallet_tx_id: { type: "string" },
  stock_tx_id: { type: "string" },
  is_debit: { type: "boolean" },
  amount: { type: "number" },
  time_stamp: { type: "date" },
} as const;

export type WalletTransaction = InferSchema<typeof walletTransactionSchemaObject>;
const walletTransactionSchema = new Schema<WalletTransaction>(
  "wallet_transactions",
  walletTransactionSchemaObject
);

export interface StockTransaction extends Entity {
  user_name: string;
  stock_tx_id: string;
  stock_id: string;
  wallet_tx_id: string | null;
  order_status: string;
  is_buy: boolean;
  order_type: string;
  stock_price: number;
  quantity: number;
  parent_tx_id: string | null;
  time_stamp: Date;
}

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

const stockTransactionSchema = new Schema<StockTransaction>(
  "stock_transactions",
  stockTransactionSchemaObject
);

const userSchemaObject = {
  user_name: { type: "string" },
  password: { type: "string" },
  name: { type: "string" },
  wallet_balance: { type: "number" },
  is_locked: { type: "boolean" },
} as const;

export type User = InferSchema<typeof userSchemaObject>;
const userSchema = new Schema<User>("users", userSchemaObject);

export {
  ownedStockSchema,
  stockSchema,
  stockTransactionSchema,
  userSchema,
  walletTransactionSchema,
};
