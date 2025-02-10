import { Repository } from "redis-om";
import { RedisInstance } from "shared-models/RedisInstance";
import {
  ownedStockSchema,
  stockSchema,
  StockTransactionSchema,
  userSchema,
  WalletTransactionSchema,
  type Stock,
  type StockOwned,
  type StockTransaction,
  type User,
  type WalletTransaction,
} from "shared-models/redisSchema";

export let redisConnection: RedisInstance | null = null;
export let userRepository: Repository<User> | null = null;
export let stockRepository: Repository<Stock> | null = null;
export let ownedStockRepository: Repository<StockOwned> | null = null;
export let stockTransactionRepository: Repository<StockTransaction> | null = null;
export let walletTransactionRepository: Repository<WalletTransaction> | null = null;
export async function setupRedisConnection() {
  redisConnection = new RedisInstance();
  redisConnection.connect();
  userRepository = await redisConnection.createRepository(userSchema);
  stockRepository = await redisConnection.createRepository(stockSchema);
  ownedStockRepository = await redisConnection.createRepository(ownedStockSchema);
  stockTransactionRepository = await redisConnection.createRepository(StockTransactionSchema);
  walletTransactionRepository = await redisConnection.createRepository(WalletTransactionSchema);
}
