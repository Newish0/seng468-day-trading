const MATCHING_SERVICE_URL = Bun.env.MATCHING_SERVICE_URL || "http://matching-engine:3000";
import { StockTransactionSchmea, userSchema } from "./tempdb";
import { RedisInstance } from "./RedisInstance";
import { Repository } from "redis-om";

let redisConnection: RedisInstance = new RedisInstance();
redisConnection.connect();
const stockTransactionRepository: Repository<any> = await redisConnection.createRepository(
  StockTransactionSchmea,
  "stock_transaction_schema",
);
const userRepository: Repository<any> = await redisConnection.createRepository(
  StockTransactionSchmea,
  "user_schema",
);

const service = {
  
  placeLimitSellOrder: async (stock_id: string, quantity: number, price: number) => {
    // Review: Check whether the user has that particular stock/quantity or in user-api?

    const limitSellRequest = {
      stock_id,
      quantity,
      price,
      stock_tx_id: "placeholder", 
    };

    let response;
    try {
      response = await fetch(`${MATCHING_SERVICE_URL}/limitSell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limitSellRequest),
      });
    } catch (err) {
      throw new Error("Unknown error with limit sell");
    }

    let result;
    try {
      result = await response.json();
    } catch (err) {
      throw new Error("Failed to parse response as JSON");
    }

    if (!result || !result.success) {
      throw new Error("Limit sell order failed");
    }

    const transaction = {
      stock_tx_id: "generate here",
      stock_id,
      wallet_tx_id: null,
      order_status: "IN_PROGRESS",
      is_buy: false,
      order_type: "LIMIT",
      stock_price: price,
      quantity,
    };

    try {
      await stockTransactionRepository.save(transaction);
    } catch (err) {
      throw new Error("Error saving limit sell transaction into database");
    }
  },

  // Helper function
  placeMarketBuyOrder: async (stock_id: string, quantity: number, seller_stock_tx_id: string, user_name: string) => {

    let user_balance;
    try{
      const user_data = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      let user_balance = user_data.wallet_balance
    }catch(err){
      throw new Error("Error fetching user data from database (Market Buy Order)")
    }

    const marketBuyRequest = {
      stock_id,
      quantity,
      stock_tx_id: seller_stock_tx_id, 
      budget: user_balance,
    };


    let response;
    try {
      response = await fetch(`${MATCHING_SERVICE_URL}/marketBuy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marketBuyRequest),
      });
    } catch (err) {
      throw new Error("Unknown error with market buy");
    }

    let result;
    try {
      result = await response.json();
    } catch (err) {
      throw new Error("Failed to parse response as JSON (Market Buy)");
    }

    if (!result || !result.success) {
      throw new Error("Market sell order failed");
    }

    // TODO: Create user transaction (for person bought) (DONE)
    // TODO: Insert wallet transaction for user (person bought)
    // TODO: Deduct balance from user
    // TODO: User stock portfolio must be updated


    const new_user_transaction = {
      stock_tx_id: 'place-holder',
      stock_id: result.data.stock_id,
      order_status: '',
      is_buy: true,
      order_type: 'MARKET',
      stock_price: result.data.price_total / result.data.quantity, 
      quantity: result.data.quantity,
      parent_tx_id: null,
      time_stamp: "data-here" 
    }

    try{
      await stockTransactionRepository.save(new_user_transaction)
    }catch(err){
      throw new Error("Error creating new user transaction (Market Buy")
    }

    // store in DB + wallet transactions/deductions, etc here
    return { success: true, data: null };


  },

  getStockPrices: async () => {
    try {
      const response = await fetch(`${MATCHING_SERVICE_URL}/getStockPrices`);

      if (!response.ok) {
        throw new Error("Failed to fetch stock prices");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to fetch stock prices");
    }
  },

  cancelStockTransaction: async (stock_tx_id: string) => {},

  partialSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string) => {},

  completeSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string) => {},
};

export default service;
