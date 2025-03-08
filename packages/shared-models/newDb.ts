import type { RedisClientType } from "redis";
import { createClient } from "redis";
import type { Entity } from "redis-om";
import { Repository, Schema } from "redis-om";
import {
  ownedStockSchema,
  stockSchema,
  stockTransactionSchema,
  userSchema,
  walletTransactionSchema,
} from "./redisSchema";

const connA = createClient({ url: "redis://redis:6379" });
const connB = createClient({ url: "redis://redis2:6379" });

console.log("HI");
await connA.connect();
console.log("BYE");
await connB.connect();

const ownedStockRepo = new Repository(ownedStockSchema, connA);
const stockRepo = new Repository(stockSchema, connA);
const stockTxRepo = new Repository(stockTransactionSchema, connB);
const userRepo = new Repository(userSchema, connA);
const walletTxRepo = new Repository(walletTransactionSchema, connA);

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

export { db, connA, connB };
