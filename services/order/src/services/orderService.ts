const MATCHING_SERVICE_URL = Bun.env.MATCHING_SERVICE_URL || "http://matching-engine:3000";
import { StockTransactionSchema, userSchema, WalletTransactionSchmea, ownedStockSchema } from "./tempdb";
import { RedisInstance } from "./RedisInstance";
import { Repository } from "redis-om";

let redisConnection: RedisInstance = new RedisInstance();
redisConnection.connect();
const stockTransactionRepository: Repository<any> = await redisConnection.createRepository(
  StockTransactionSchema,
  "stock_transaction_schema",
);
const userRepository: Repository<any> = await redisConnection.createRepository(userSchema, "user_schema");

const walletTransactionRepository: Repository<any> = await redisConnection.createRepository(
  WalletTransactionSchmea,
  "wallet_transaction_schema",
);

const stockOwnedRepository: Repository<any> = await redisConnection.createRepository(ownedStockSchema, "stock_owned_schema");

const service = {
  placeLimitSellOrder: async (stock_id: string, quantity: number, price: number, user_name: string) => {
    // Review: Check whether the user has that particular stock/quantity or in user-api?

    const limitSellRequest = {
      stock_id,
      quantity,
      price,
      stock_tx_id: "placeholder",
      user_name,
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

  placeMarketBuyOrder: async (stock_id: string, quantity: number, user_name: string) => {
    let user_balance;
    try {
      const user_data = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      user_balance = user_data.wallet_balance;
    } catch (err) {
      throw new Error("Error fetching user data from database (Market Buy Order)");
    }

    // new transaction that has NOT been approved by Matching Engine yet
    let new_user_transaction = {
      stock_tx_id: "place-holder",
      parent_tx_id: null,
      stock_id: stock_id,
      wallet_tx_id: null,
      order_status: "",
      is_buy: true,
      order_type: "MARKET",
      stock_price: 0, // HACK: set price to 0 b/c price unknown atm (not matched by matching engine)
      quantity: quantity,
      time_stamp: "data-here",
    };

    try {
      new_user_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (err) {
      throw new Error("Error creating new user transaction (Market Buy)");
    }

    const marketBuyRequest = {
      stock_id,
      quantity,
      stock_tx_id: new_user_transaction.stock_tx_id,
      budget: user_balance,
      user_name,
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

    // create wallet transaction here
    let new_wallet_transaction;
    try {
      new_wallet_transaction = {
        wallet_tx_id: "generate_wallet_tx_id",
        stock_tx_id: new_user_transaction.stock_tx_id,
        isDebit: true, // TODO: figure out what's the req for this
        amount: result.data.price_total,
        timestamp: "data-here",
      };
      new_wallet_transaction = await walletTransactionRepository.save(new_wallet_transaction);
    } catch (error) {
      throw new Error("Error creating new wallet transaction (Market Buy");
    }

    // update new_user_transaction
    try {
      new_user_transaction.order_status = "COMPLETED";
      // Matching Engine provides price_total instead of stock price according to matching engine API Specs?
      new_user_transaction.stock_price = result.data.price_total / result.data.quantity;
      new_user_transaction.wallet_tx_id = new_wallet_transaction.wallet_tx_id;
      new_user_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (error) {
      throw new Error("Error updating new_user_transaction");
    }

    // update the user balance for buyer
    try {
      let user = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      user.wallet_balance = user.wallet_balance - result.data.price_total;
      await userRepository.save(user);
    } catch (error) {
      throw new Error("Error updating user (buyer) wallet balance (Market Buy");
    }

    try {
      let user = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      user.stock_transaction_history.push(new_user_transaction.stock_tx_id);
      user.wallet_transaction_history.push(new_wallet_transaction.wallet_tx_id);
      await userRepository.save(user);
    } catch (error) {
      throw new Error("Error adding transaction/wallet transaction into user portfolio (Market Buy)");
    }

    try {
      // TODO:
      // Check if user already owns shares in this specific stock, if they do, add
      // the number of shares bought in this buy order to total quantity
      // else if user does not have shares in this stock yet, add a new stockOwned entry
    } catch (error) {
      throw new Error("Error creating new stockOwned entry for buyer (Market Buy)");
    }
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

  cancelStockTransaction: async (stock_tx_id: string) => {
    // Cancellation of a limit sell order
    // TODO: Fetch stock_id, quantity, price from transaction to pass to matching engine
    //  stock_id: string,
    //  quantity: number,
    //  price: number,
    //  stock_tx_id: string
    // TODO: Query the matching engine for a cancel sell limit
    // TODO: Modify the cancelled limit sell transaction to status="CANCELLED"
    // TODO: Modify owner of cancelled limit sell's portfolio to include the cancelled stock ( or add to existing stock share quantity
    // if he still has shares they did not create a sell order for )
  },

  partialSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string, user_name: string) => {
    // Update the parent seller transaction so status is IN_PROGRESS
    // Create new wallet transaction for seller for the partial order
    // Increase user balance of seller
    // Create a new transaction, with the parent_tx_id equal to the parent seller trans, with status complete

    let parent_transaction;

    // Gets the main parent limit sell transaction and changes the status to 'PARTIALLY_COMPLETE'
    try {
      parent_transaction = await stockTransactionRepository.search().where("stock_tx_id").equals(stock_tx_id).returnFirst();
      parent_transaction.order_status = "PARTIALLY_COMPELTE";
      parent_transaction = await parent_transaction.save();
    } catch (error) {
      throw new Error("Error updating the status of parent sell transaction to PARTIALLY_COMPLETE (partialSell)");
    }

    let new_user_transaction = {
      stock_tx_id: "new trans id here",
      parent_tx_id: stock_tx_id,
      stock_id: stock_id,
      wallet_tx_id: "", // How do I get this?
      order_status: "COMPLETED",
      is_buy: true,
      order_type: "MARKET",
      stock_price: 0, // HACK: set price to 0 b/c price unknown atm (not matched by matching engine)
      quantity: quantity,
      time_stamp: "data-here",
    };

    // Creates a new transaction with the parent_stock_tx_id to the original limit sell transaction with status COMPLETED
    try {
      new_user_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (error) {
      throw new Error("Error creating a new partial complete transaction for seller (partialSell)");
    }

    const total_amount = price * quantity;

    let new_wallet_transaction = {
      wallet_tx_id: "generate_wallet_tx_id",
      stock_tx_id: new_user_transaction.stock_tx_id,
      isDebit: false,
      amount: total_amount,
      timestamp: "data-here",
    };

    // create a new wallet transaction for seller (a child sell order) with status completed
    try {
      new_wallet_transaction = await walletTransactionRepository.save(new_wallet_transaction);
    } catch (error) {
      throw new Error("Error creating a new wallet transaction for seller (partialSell)");
    }

    // update the new user transaction of the partial sell with the new wallet id
    try {
      new_user_transaction.wallet_tx_id = new_wallet_transaction.wallet_tx_id;
      new_wallet_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (error) {
      throw new Error("Error creating a new wallet transaction for seller (partialSell)");
    }

    try {
      let user = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      user.wallet_balance = user.wallet_balance - total_amount;
      await userRepository.save(user);
    } catch (error) {
      throw new Error("Error updating the wallet of the limit sell user (partialSell)");
    }
  },

  completeSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string) => {
    // Updates the OG sell transaction to status = COMPLETED 
    try{
      let transaction = await stockTransactionRepository.search().where("stock_tx_id").equals(stock_tx_id).returnFirst();
      transaction.status = "COMPLETED";
      await stockTransactionRepository.save(transaction);
    }catch(err){
      throw new Error("Error updating limit sell order status to completed (completeSell)");
    }
  },
};

export default service;
