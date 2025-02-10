import {
  type GetStockPricesRequest,
  type GetStockPricesResponse,
} from "shared-types/dtos/order/getStockPrices";
import type { ContextWithUser } from "shared-types/hono";
import { makeInternalRequest } from "shared-utils/internalCommunication";
import stockService from "../services/stockService";

const stockController = {
  getStockPrices: async (c: ContextWithUser) => {
    try {
      const response = await makeInternalRequest<GetStockPricesRequest, GetStockPricesResponse>({
        body: undefined,
      })("orderService", "getStockPrices");
      if (!response.success || !response.data.success) {
        return c.json({ success: false, data: null }, 400);
      }
      const sortedData = response.data.data.sort((stock1, stock2) => {
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
      return c.json({ success: true, data: sortedData });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  getStockPortfolio: async (c: ContextWithUser) => {
    const { username } = c.get("user");
    try {
      const userStocks = await stockService.getUserStockPortfolio(username);
      const userStocksOwned = userStocks
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
      return c.json({ success: false, data: null }, 500);
    }
  },
  getStockTransactions: async (c: ContextWithUser) => {
    const { username } = c.get("user");
    try {
      const userStockTransactions = await stockService.getUserStockTransactions(username);
      const userStockTransactionsFormatted = userStockTransactions.map((transaction) => ({
        stock_tx_id: transaction.stock_tx_id,
        stock_id: transaction.stock_id,
        wallet_tx_id: transaction.wallet_tx_id,
        order_status: transaction.order_status,
        is_buy: transaction.is_buy,
        order_type: transaction.order_type,
        stock_price: transaction.stock_price,
        quantity: transaction.quantity,
        parent_tx_id: transaction.parent_tx_id,
        time_stamp: transaction.time_stamp.toISOString(),
      }));
      return c.json({ success: true, data: userStockTransactionsFormatted });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
};

export default stockController;
