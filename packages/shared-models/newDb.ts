import type { RedisClientType } from "redis";
import { createClient } from "redis";
import type { Entity } from "redis-om";
import { Repository, Schema } from "redis-om";
import {
  ownedStockSchema,
  stockSchema,
  StockTransactionSchema,
  userSchema,
  WalletTransactionSchema,
} from "./redisSchema";

const connA = createClient({ url: "redis://redis:6379" });
const connB = createClient({ url: "redis://redis2:6379" });

await Promise.all([connA.connect()]);

const ownedStockRepo = new Repository(ownedStockSchema, connA);
const stockRepo = new Repository(stockSchema, connA);
const stockTxRepo = new Repository(StockTransactionSchema, connA);
const userRepo = new Repository(userSchema, connA);
const walletTxRepo = new Repository(WalletTransactionSchema, connA);

const db = {
  ownedStockRepo,
  stockRepo,
  stockTxRepo,
  userRepo,
  walletTxRepo,
} as const;

await Promise.all(
  Object.values(db).map(async (repo) => {
    try {
      await repo.createIndex();
    } catch (error) {
      console.error("Failed to create index:", error);
    }
  })
);

export default db;
