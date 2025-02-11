import type { Stock } from "shared-models/redisSchema";
import {
  ownedStockRepository,
  redisConnection,
  setupRedisConnection,
  stockRepository,
  stockTransactionRepository,
} from "./userApiService";

const stockService = {
  async createStock(stock_name: string) {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    const existingStock = await stockRepository!
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
    const stock_id = await stockRepository!.save(stock);
    return stock_id;
  },
  async getUserStockPortfolio(userName: string) {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    try {
      const userStocks = await ownedStockRepository!
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
    if (!redisConnection) {
      await setupRedisConnection();
    }
    try {
      const userStockTransactions = await stockTransactionRepository!
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
