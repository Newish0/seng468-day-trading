import { createClient } from "redis";
import { Repository } from "redis-om";
import {
  ownedStockSchema,
  stockSchema,
  stockTransactionSchema,
  userSchema,
  walletTransactionSchema,
} from "./redisSchema";

const DB1_URL = Bun.env.REDIS1_URL || "redis://redis1:6379";
const DB2_URL = Bun.env.REDIS2_URL || "redis://redis2:6379";
const DB3_URL = Bun.env.REDIS3_URL || "redis://redis3:6379";
const DB4_URL = Bun.env.REDIS4_URL || "redis://redis4:6379";
const DB5_URL = Bun.env.REDIS5_URL || "redis://redis5:6379";

const connOwnedStock = createClient({ url: DB1_URL });
const connStock = createClient({ url: DB2_URL });
const connStockTx = createClient({ url: DB3_URL });
const connUser = createClient({ url: DB4_URL });
const connWalletTx = createClient({ url: DB5_URL });

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
