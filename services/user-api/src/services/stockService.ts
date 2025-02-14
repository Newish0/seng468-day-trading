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
  async addStockToUser(userName: string, stockId: string, qty: number) {
    let existingStock: Stock | null;
    try {
      existingStock = await stockRepository
        .search()
        .where("stock_id")
        .equals(stockId)
        .returnFirst();
    } catch (err) {
      throw new Error(`Failed to get stock "${stockId}"`, {
        cause: err,
      });
    }

    if (!existingStock) {
      throw new Error("Stock does not exists");
    }

    let existingOwnedStock: StockOwned | null;
    try {
      existingOwnedStock = await ownedStockRepository
        .search()
        .where("stock_id")
        .equals(stockId)
        .returnFirst();
    } catch (err) {
      throw new Error(`Failed to get stock owned while searching for stock ID "${stockId}"`, {
        cause: err,
      });
    }

    const newQty = (existingOwnedStock?.current_quantity ?? 0) + qty;

    try {
      await ownedStockRepository.save({
        ...existingOwnedStock, // Make this an update if it already exists
        user_name: userName,
        current_quantity: newQty,
        stock_id: stockId,
        stock_name: existingStock.stock_name,
      });
    } catch (err) {
      throw new Error(`Failed to update owned stock "${stockId}" on user "${userName}"`, {
        cause: err,
      });
    }
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
