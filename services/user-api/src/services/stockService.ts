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
    // TODO: Do I need to explicitly check if stock_name is available or is there a unique constraint?
    // TODO: Is it fine to have stock_id and stock_name the same?
    const stock: Stock = {
      stock_id: stock_name,
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
