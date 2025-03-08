import { createClient } from "redis";
import { Repository } from "redis-om";
import {
  ownedStockSchema,
  stockSchema,
  stockTransactionSchema,
  userSchema,
  walletTransactionSchema,
} from "./redisSchema";

const connOwnedStock = createClient({ url: "redis://redis1:6379" });
const connStock = createClient({ url: "redis://redis2:6379" });
const connStockTx = createClient({ url: "redis://redis3:6379" });
const connUser = createClient({ url: "redis://redis4:6379" });
const connWalletTx = createClient({ url: "redis://redis5:6379" });

await Promise.all([
  connOwnedStock.connect(),
  connStock.connect(),
  connStockTx.connect(),
  connUser.connect(),
  connWalletTx.connect(),
]);

const ownedStockRepo = new Repository(ownedStockSchema, connOwnedStock);
const stockRepo = new Repository(stockSchema, connStock);
const stockTxRepo = new Repository(stockTransactionSchema, connStockTx);
const userRepo = new Repository(userSchema, connUser);
const walletTxRepo = new Repository(walletTransactionSchema, connWalletTx);

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

export { db, connOwnedStock, connStock, connStockTx, connUser, connWalletTx };
