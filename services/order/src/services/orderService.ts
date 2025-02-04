import {
  StockTransactionSchema,
  userSchema,
  WalletTransactionSchmea,
  ownedStockSchema,
} from "./tempdb";
import { RedisInstance } from "./RedisInstance";
import { Repository } from "redis-om";
import {
  type StockTransaction,
  type WalletTransaction,
  ORDER_STATUS,
  ORDER_TYPE,
} from "shared-types/transactions";
import type {
  LimitSellOrderRequest,
  MarketBuyRequest,
  CancelSellRequest,
} from "shared-types/dtos/order-service/orderRequests";
import type { User } from "shared-types/user";
import type { OwnedStock } from "shared-types/stocks";
import { MatchingEngineService } from "./matchingEngineService";

const matEngSvc = new MatchingEngineService(
  Bun.env.MATCHING_SERVICE_URL || "http://matching-engine:3000"
);

const redisConnection: RedisInstance = new RedisInstance();
redisConnection.connect();
const stockTransactionRepository: Repository<StockTransaction> =
  await redisConnection.createRepository(StockTransactionSchema, "stock_transaction_schema");
const userRepository: Repository<User> = await redisConnection.createRepository(
  userSchema,
  "user_schema"
);

const walletTransactionRepository: Repository<WalletTransaction> =
  await redisConnection.createRepository(WalletTransactionSchmea, "wallet_transaction_schema");

const stockOwnedRepository: Repository<OwnedStock> = await redisConnection.createRepository(
  ownedStockSchema,
  "stock_owned_schema"
);

const service = {
  /**
   * Places a limit sell order by sending a request to the matching engine,
   * and then saves the order as a stock transaction in the database.
   *
   * @param {string} stock_id - The ID of the stock being sold.
   * @param {number} quantity - The quantity of stock to sell.
   * @param {number} price - The price at which the stock is to be sold.
   * @param {string} user_name - The name of the user placing the sell order.
   *
   * @throws {Error} - Throws error if there is an issue with the matching engine or saving the transaction.
   */
  placeLimitSellOrder: async (
    stock_id: string,
    quantity: number,
    price: number,
    user_name: string
  ) => {
    // Review: Check whether the user has that particular stock/quantity here or in user-api?

    let userData: User | null; // contains user info from database
    try {
      userData = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      if (!userData) throw new Error("Error finding user (placeLimitSellOrder)");
    } catch (err) {
      throw new Error("Error fetching user data from database (Limit Sell Order)");
    }

    const txId = crypto.randomUUID();

    // Initializes limit sell request to request the matching-engine
    const limitSellRequest: LimitSellOrderRequest = {
      stock_id,
      quantity,
      price,
      stock_tx_id: txId,
      user_name,
    };

    // Constructs a limit sell transaction
    const transaction: StockTransaction = {
      stock_tx_id: txId,
      stock_id,
      wallet_tx_id: null,
      order_status: ORDER_STATUS.IN_PROGRESS,
      is_buy: false,
      order_type: ORDER_TYPE.LIMIT,
      stock_price: price,
      quantity,
      parent_tx_id: null,
      time_stamp: "date-here",
    };

    // Saves limit sell order to the database
    try {
      await stockTransactionRepository.save(transaction);
    } catch (err) {
      throw new Error("Error saving limit sell transaction into database");
    }

    // Add limit sell transaction to user
    userData.stock_transaction_history.push(transaction.stock_tx_id);
    try {
      await userRepository.save(userData);
    } catch {
      throw new Error("Error adding transaction to user in the database");
    }

    const result = await matEngSvc.placeLimitSellOrder(limitSellRequest);
  },

  /**
   * Places a market buy order by sending a request to the matching engine,
   * processes the response, and updates the user's stock and wallet balances accordingly.
   *
   * @param {string} stock_id - The ID of the stock being purchased.
   * @param {number} quantity - The number of shares to buy.
   * @param {string} user_name - The name of the user placing the buy order.
   *
   * @throws {Error} - Throws error if there is an issue fetching user data, with the matching engine request,
   * or with saving the transaction and updating the user's balance.
   */
  placeMarketBuyOrder: async (stock_id: string, quantity: number, user_name: string) => {
    let userData: User | null; // contains user info from database

    // Fetches the buyer's user_balance (required for matching-engine)
    try {
      userData = await userRepository.search().where("user_name").equals(user_name).returnFirst();

      if (!userData) throw new Error("Error finding user (placeMarketOrder)");
    } catch (err) {
      throw new Error("Error fetching user data from database (Market Buy Order)");
    }

    const buyTxId = crypto.randomUUID();

    // New buyer transaction that has NOT been approved by Matching Engine yet
    let new_user_transaction: StockTransaction = {
      stock_tx_id: buyTxId,
      parent_tx_id: null,
      stock_id: stock_id,
      wallet_tx_id: null,
      order_status: ORDER_STATUS.PENDING,
      is_buy: true,
      order_type: ORDER_TYPE.MARKET,
      stock_price: 0, // HACK: set price to 0: price unknown atm (not matched by matching engine)
      quantity: quantity,
      time_stamp: "date-here",
    };

    const marketBuyRequest: MarketBuyRequest = {
      stock_id,
      quantity,
      stock_tx_id: new_user_transaction.stock_tx_id,
      budget: userData.wallet_balance,
      user_name,
    };

    const result = await matEngSvc.placeMarketBuyOrder(marketBuyRequest);

    // Create wallet transaction for buyer. (Before new_user_transaction stored into db)
    const walletTxId = crypto.randomUUID();
    let new_wallet_transaction: WalletTransaction;
    try {
      new_wallet_transaction = {
        wallet_tx_id: walletTxId,
        stock_tx_id: new_user_transaction.stock_tx_id,
        is_debit: true, // TODO: debit functionality has not been implemented yet
        amount: result.data.price_total,
        time_stamp: "date-here",
      };
      new_wallet_transaction = await walletTransactionRepository.save(new_wallet_transaction);
    } catch (error) {
      throw new Error("Error creating new wallet transaction (Market Buy");
    }

    // update new_user_transaction and store into database
    try {
      new_user_transaction.order_status = ORDER_STATUS.COMPLETED;
      // Matching Engine provides price_total instead of stock price according to matching engine API Specs?
      new_user_transaction.stock_price = result.data.price_total / result.data.quantity;
      new_user_transaction.wallet_tx_id = new_wallet_transaction.wallet_tx_id;
      new_user_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (error) {
      throw new Error("Error storing new_user_transaction for buyer (placeMarketBuyOrder)");
    }

    // update the user balance for buyer (updates the user fetched at the start of method)
    try {
      userData.wallet_balance = userData.wallet_balance - result.data.price_total;
      userData.stock_transaction_history.push(new_user_transaction.stock_tx_id);
      userData.wallet_transaction_history.push(new_wallet_transaction.wallet_tx_id);
      await userRepository.save(userData);
    } catch (error) {
      throw new Error("Error updating buyer information for buy order(placeMarketBuyOrder)");
    }

    // TODO:
    // Check if buyer already owns shares in this specific stock, if they do, add
    // the number of shares bought in this buy order to total quantity
    // else if user does not have shares in this stock yet, add a new stockOwned entry
  },

  /**
   * Fetches the current stock prices from the matching engine.
   *
   * @returns {Promise<Object>} - Resolves with the stock prices data fetched from the matching engine.
   *
   * @throws {Error} - Throws error if the fetch request fails or if the response cannot be parsed.
   */
  getStockPrices: async () => {
    return await matEngSvc.getStockPrices();
  },

  /**
   * Cancels an existing limit sell order by sending a cancel request to the matching engine,
   * and then updates the order status to 'CANCELLED' in the database.
   *
   * @param {string} stock_tx_id - The transaction ID of the stock transaction to cancel.
   *
   * @throws {Error} - Throws error if the transaction cannot be found or canceled.
   */
  cancelStockTransaction: async (stock_tx_id: string) => {
    let transaction: StockTransaction | null;

    try {
      transaction = await stockTransactionRepository
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();
    } catch (error) {
      throw new Error("Error fetching the transaction to cancel (cancelStockTransaction");
    }

    if (!transaction) {
      throw new Error("Error fetching the transaction to cancel (cancelStockTransaction");
    }

    const cancelSellRequest: CancelSellRequest = {
      stock_id: transaction.stock_id,
      quantity: transaction.quantity,
      price: transaction.stock_price,
      stock_tx_id: transaction.stock_tx_id,
    };

    // Query the matching engine to cancel the limit order
    await matEngSvc.cancelSellOrder(cancelSellRequest);

    // Modify the cancelled limit sell transaction to status="CANCELLED" (reuses the entry fetched at start of method)
    try {
      transaction.order_status = ORDER_STATUS.CANCELLED;
      await stockTransactionRepository.save(transaction);
    } catch (error) {
      throw new Error(
        "Error with updating limit sell order's status to CANCELLED (callStockTransaction)"
      );
    }

    // TODO: Modify owner of cancelled limit sell's portfolio to include the cancelled stock (or add to existing stock share quantity
    // if he still has shares they did not create a sell order for )
  },

  /**
   * Handles partial fulfillment of a sell order. This includes updating the parent transaction
   * to 'PARTIALLY_COMPLETED', creating a new COMPLETED transaction for the partial sale, and adjusting
   * the seller's wallet balance accordingly (adds sold amount to balance).
   *
   * @param {string} stock_id - The ID of the stock being sold.
   * @param {number} quantity - The quantity of stock being partially sold.
   * @param {number} price - The price at which the partial sale occurs.
   * @param {string} stock_tx_id - The **parent** transaction ID of the original sell order.
   * @param {string} user_name - The name of the user who placed the original sell order.
   *
   * @throws {Error} - Throws error if there is an issue with updating transactions, wallet balance, or fetching user data.
   */
  partialSell: async (
    stock_id: string,
    quantity: number,
    price: number,
    stock_tx_id: string,
    user_name: string
  ) => {
    // Gets the main parent limit sell transaction and changes the status to 'PARTIALLY_COMPLETE'
    try {
      const parent_transaction: StockTransaction | null = await stockTransactionRepository
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();

      if (!parent_transaction) {
        throw new Error(`Parent Transaction with id ${stock_tx_id} does not exist (partialSell)`);
      }

      parent_transaction.order_status = ORDER_STATUS.PARTIALLY_COMPLETED;
      await stockTransactionRepository.save(parent_transaction);
    } catch (error) {
      throw new Error(
        "Error updating the status of parent sell transaction to PARTIALLY_COMPLETE (partialSell)"
      );
    }

    const newStockTxId = "new trans id here";
    const newWalletTxId = "generate_wallet_tx_id";

    // Creates a new transaction with the parent_stock_tx_id linking to the original limit sell transaction with status COMPLETED
    let committedStockTx;
    try {
      const newStockTxForPartial: StockTransaction = {
        stock_tx_id: newStockTxId,
        parent_tx_id: stock_tx_id,
        stock_id: stock_id,
        wallet_tx_id: newWalletTxId, // Optimistically include wallet transaction id
        order_status: ORDER_STATUS.COMPLETED,
        is_buy: true,
        order_type: ORDER_TYPE.MARKET,
        stock_price: 0, // HACK: set price to 0 b/c price unknown atm (not matched by matching engine)
        quantity: quantity,
        time_stamp: "data-here", // TODO: Add timestamp 
      };
      committedStockTx = await stockTransactionRepository.save(newStockTxForPartial);
    } catch (error) {
      throw new Error("Error creating a new partial complete transaction for seller (partialSell)");
    }

    const total_amount: number = price * quantity; // total_amount not provided by the matching-engine

    // create a new wallet transaction for seller (a child sell order) with status completed
    try {
      const newWalletTx: WalletTransaction = {
        wallet_tx_id: newWalletTxId,
        stock_tx_id: newStockTxId,
        is_debit: false,
        amount: total_amount,
        time_stamp: "data-here", // TODO: Add timestamp 
      };
      await walletTransactionRepository.save(newWalletTx);
    } catch (error) {
      // Rollback the optimistic wallet tx ID in the new stock transaction
      try {
        stockTransactionRepository.save({ ...committedStockTx, wallet_tx_id: null });
      } catch (err) {
        throw new Error(
          `Failed to rollback optimistic wallet ID in stock transaction ${newStockTxId}`
        );
      }

      throw new Error("Error creating a new wallet transaction for seller (partialSell)");
    }

    // updates the seller's wallet after a successful partial sell of their limit sell order
    try {
      let user: User | null = await userRepository
        .search()
        .where("user_name")
        .equals(user_name)
        .returnFirst();
      if (!user) {
        throw new Error("Error finding user (partialSell)");
      }
      user.wallet_balance = user.wallet_balance + total_amount;
      await userRepository.save(user);
    } catch (error) {
      throw new Error("Error updating the wallet of the limit sell user (partialSell)");
    }
  },

  /**
   * Marks the original sell transaction as COMPLETED once the full order is fulfilled.
   *
   * @param {string} stock_id - The ID of the stock being sold.
   * @param {number} quantity - The total quantity of stock sold.
   * @param {number} price - The price at which the stock is sold.
   * @param {string} stock_tx_id - The transaction ID of the original sell order.
   *
   * @throws {Error} - Throws error if there is an issue with updating the transaction to 'COMPLETED'.
   */
  completeSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string) => {
    // Updates the original sell transaction status to COMPLETED
    try {
      let transaction: StockTransaction | null = await stockTransactionRepository
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();

      if (!transaction)
        throw new Error(`The transaction with id ${stock_tx_id} does not exist (completeSell)`);

      transaction.order_status = ORDER_STATUS.COMPLETED;
      await stockTransactionRepository.save(transaction);
    } catch (err) {
      throw new Error("Error updating limit sell order status to completed (completeSell)");
    }
  },
};

export default service;
