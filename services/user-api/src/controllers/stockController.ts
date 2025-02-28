import type { ContextWithUser } from "shared-types/hono";
import { handleError } from "shared-utils";
import stockService from "../services/stockService";

const stockController = {
  getStockPortfolio: async (c: ContextWithUser) => {
    const { username } = c.get("user");
    try {
      const userStocks = await stockService.getUserStockPortfolio(username);
      const userStocksOwned = userStocks
        .filter((stock) => stock.current_quantity) // filter out stocks with 0 quantity
        .map((stock) => ({
          stock_id: stock.stock_id,
          stock_name: stock.stock_name,
          quantity_owned: stock.current_quantity,
        }))
        .sort((stock1, stock2) => {
          const stockName1Upper = stock1.stock_name.toUpperCase();
          const stockName2Upper = stock2.stock_name.toUpperCase();
          if (stockName1Upper < stockName2Upper) {
            return 1;
          }
          if (stockName1Upper > stockName2Upper) {
            return -1;
          }
          return 0;
        });
      return c.json({ success: true, data: userStocksOwned });
    } catch (e) {
      return handleError(c, e, "Failed to get stock portfolio", 500);
    }
  },
  getStockTransactions: async (c: ContextWithUser) => {
    const { username } = c.get("user");
    try {
      const userStockTransactions = await stockService.getUserStockTransactions(username);
      const userStockTransactionsFormatted = userStockTransactions
        .map((transaction) => ({
          stock_tx_id: transaction.stock_tx_id,
          stock_id: transaction.stock_id,
          wallet_tx_id: transaction.wallet_tx_id,
          order_status: transaction.order_status,
          is_buy: transaction.is_buy,
          order_type: transaction.order_type,
          stock_price: transaction.stock_price,
          quantity: transaction.quantity,
          parent_stock_tx_id: transaction.parent_tx_id, // HACK: Spec require 'parent_stock_tx_id', so it's been added here but not applied globally yet
          time_stamp: transaction.time_stamp.toISOString(),
        }))
        .sort((t1, t2) => t1.time_stamp.localeCompare(t2.time_stamp));
      return c.json({ success: true, data: userStockTransactionsFormatted });
    } catch (e) {
      return handleError(c, e, "Failed to get stock transactions", 500);
    }
  },
};

export default stockController;
