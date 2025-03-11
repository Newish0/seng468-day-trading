import { type Stock, type StockOwned } from "shared-models/redisSchema";

import { db } from "shared-models/newDb";

const stockService = {
  async createStock(stock_name: string) {
    const existingStock = await db.stockRepo
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
    const saved_stock = await db.stockRepo!.save(stock);
    return saved_stock.stock_id;
  },

  async addStockToUser(userName: string, stockId: string, qty: number) {
    let existingOwnedStock: StockOwned | null;
    try {
      existingOwnedStock = await db.ownedStockRepo
        .search()
        .where("stock_id")
        .equals(stockId)
        .and("user_name")
        .equals(userName)
        .returnFirst();
    } catch (err) {
      throw new Error(`Failed to get stock owned while searching for stock ID "${stockId}"`, {
        cause: err,
      });
    }

    let stockName = "";
    if (existingOwnedStock) {
      stockName = existingOwnedStock.stock_name;
    } else {
      let existingStock: Stock | null = null;
      try {
        existingStock = await db.stockRepo.search().where("stock_id").equals(stockId).returnFirst();
      } catch (err) {
        throw new Error(`Failed to get stock "${stockId}"`, {
          cause: err,
        });
      }

      if (!existingStock) throw new Error("Stock does not exists");

      stockName = existingStock.stock_name;
    }

    const newQty = (existingOwnedStock?.current_quantity ?? 0) + qty;

    try {
      await db.ownedStockRepo.save({
        ...existingOwnedStock, // Make this an update if it already exists
        user_name: userName,
        current_quantity: newQty,
        stock_id: stockId,
        stock_name: stockName,
      });
    } catch (err) {
      throw new Error(`Failed to update owned stock "${stockId}" on user "${userName}"`, {
        cause: err,
      });
    }
  },
  async getUserStockPortfolio(userName: string) {
    try {
      const userStocks = await db.ownedStockRepo
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
      const userStockTransactions = await db.stockTxRepo
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
