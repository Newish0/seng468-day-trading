import { Repository } from "redis-om";
import { RedisInstance } from "shared-models/RedisInstance";
import {
  ownedStockSchema,
  type Stock,
  type StockOwned,
  stockSchema,
  type StockTransaction,
  StockTransactionSchema,
} from "shared-models/redisSchema";

// Creating connection here due to the implementation of RedisInstance.ts
// This is probably NOT good - causes multiple connection creation?
let redisConnection: RedisInstance = new RedisInstance();
try {
  redisConnection.connect();
} catch (error) {
  throw new Error("Error starting database server");
}
const stockRepository: Repository<Stock> = await redisConnection.createRepository(stockSchema);
const ownedStockRepository: Repository<StockOwned> = await redisConnection.createRepository(
  ownedStockSchema
);
const stockTransactionRepository: Repository<StockTransaction> =
  await redisConnection.createRepository(StockTransactionSchema);

const stockService = {
  async createStock(stock_name: string) {
    const existingStock = await stockRepository
      .search()
      .where("stock_name")
      .equals(stock_name)
      .returnFirst();
    if (existingStock) {
      throw new Error("Stock already exists");
    }
    const stock: Stock = {
      stock_id: crypto.randomUUID(),
      stock_name,
    };
    const saved_stock = await stockRepository!.save(stock);
    return saved_stock.stock_id;
  },
  async getUserStockPortfolio(userName: string) {
    try {
      const userStocks = await ownedStockRepository
        .search()
        .where("user_name")
        .equals(userName)
        .returnAll();
      return userStocks;
    } catch (e) {
      throw new Error("Failed to get user stock portfolio");
    }
  },
  async getUserStockTransactions(userName: string) {
    try {
      const userStockTransactions = await stockTransactionRepository
        .search()
        .where("user_name")
        .equals(userName)
        .returnAll();
      return userStockTransactions;
    } catch (e) {
      throw new Error("Failed to get user stock transactions");
    }
  },
};

export default stockService;
