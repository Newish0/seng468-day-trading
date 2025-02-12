import { EntityId, Repository } from "redis-om";
import { RedisInstance } from "shared-models/RedisInstance";
import type { StockOwned, StockTransaction, WalletTransaction } from "shared-models/redisSchema";
import {
  ownedStockSchema,
  StockTransactionSchema,
  userSchema,
  WalletTransactionSchema,
} from "shared-models/redisSchema";
import type {
  CancelSellRequest,
  LimitSellOrderRequest,
  MarketBuyRequest,
} from "shared-types/dtos/order-service/orderRequests";
import { ORDER_STATUS, ORDER_TYPE } from "shared-types/transactions";
import type { User } from "shared-types/user";
import { MatchingEngineService } from "./matchingEngineService";

const matEngSvc = new MatchingEngineService(
  Bun.env.MATCHING_ENGINE_HOST || "http://matching-engine:3000"
);

const redisConnection: RedisInstance = new RedisInstance();
redisConnection.connect();

const stockTransactionRepository: Repository<StockTransaction> =
  await redisConnection.createRepository(StockTransactionSchema);

const userRepository: Repository<User> = await redisConnection.createRepository(userSchema);

const walletTransactionRepository: Repository<WalletTransaction> =
  await redisConnection.createRepository(WalletTransactionSchema);

const stockOwnedRepository: Repository<StockOwned> = await redisConnection.createRepository(
  ownedStockSchema
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
    let transaction: StockTransaction = {
      stock_tx_id: txId,
      stock_id,
      wallet_tx_id: null,
      order_status: ORDER_STATUS.IN_PROGRESS,
      is_buy: false,
      order_type: ORDER_TYPE.LIMIT,
      stock_price: price,
      quantity,
      parent_tx_id: null,
      time_stamp: new Date(),
    };

    // Saves limit sell order to the database
    try {
      transaction = await stockTransactionRepository.save(transaction);
    } catch (err) {
      throw new Error("Error saving limit sell transaction into database");
    }

    const result = await matEngSvc.placeLimitSellOrder(limitSellRequest);

    if (result.success) {
      let ownedStock: StockOwned | null;
      try {
        ownedStock = await stockOwnedRepository
          .search()
          .where("stock_id")
          .equals(stock_id)
          .and("user_name")
          .equals(user_name)
          .returnFirst();
        if (!ownedStock) throw new Error("User does not own this stock (placeLimitSellOrder)");
      } catch (err) {
        throw new Error("Error fetching owned stock data from database");
      }

      if (ownedStock.current_quantity <= quantity) {
        // If the quantity to sell equals the owned quantity, delete the record
        try {
          const ownedStockEntityId = (ownedStock as any)[EntityId]; // HACK: Get's the Entity id of ownedStock and bypasses ts typecheck
          await stockOwnedRepository.remove(ownedStockEntityId);
        } catch (err) {
          throw new Error("Error deleting owned stock record from database");
        }
      } else {
        // If there's more stock left, just decrease the quantity
        ownedStock = { ...ownedStock, current_quantity: ownedStock.current_quantity - quantity };
        try {
          await stockOwnedRepository.save(ownedStock);
        } catch (err) {
          throw new Error("Error updating owned stock quantity in database");
        }
      }
    }
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
      time_stamp: new Date(),
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
        is_debit: true,
        amount: result.data.price_total,
        time_stamp: new Date(),
        user_name,
      };
      new_wallet_transaction = await walletTransactionRepository.save(new_wallet_transaction);
    } catch (error) {
      throw new Error("Error creating new wallet transaction (Market Buy");
    }

    // update new_user_transaction and store into database
    try {
      // Matching Engine provides price_total instead of stock price according to matching engine API Specs?
      new_user_transaction = {
        ...new_user_transaction,
        order_status: ORDER_STATUS.COMPLETED,
        stock_price: result.data.price_total / result.data.quantity,
        wallet_tx_id: new_wallet_transaction.wallet_tx_id,
      };
      new_user_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (error) {
      throw new Error("Error storing new_user_transaction for buyer (placeMarketBuyOrder)");
    }

    // update the user balance for buyer (updates the user fetched at the start of method)
    try {
      userData.wallet_balance = userData.wallet_balance - result.data.price_total;
      userData = await userRepository.save(userData);
    } catch (error) {
      throw new Error("Error updating buyer information for buy order(placeMarketBuyOrder)");
    }

    // TODO: Move into separate function as same func in cancelTransaction
    try {
      // Check if user owns stock already
      let ownedStock: StockOwned | null = await stockOwnedRepository
        .search()
        .where("stock_id")
        .equals(stock_id)
        .and("user_name")
        .equals(user_name)
        .returnFirst();

      if (ownedStock) {
        ownedStock = { ...ownedStock, current_quantity: ownedStock.current_quantity + quantity };
        await stockOwnedRepository.save(ownedStock);
      } else {
        // If the user does not own the stock, create a new entry
        let newOwnedStock: StockOwned = {
          stock_id,
          user_name,
          stock_name: "Stock Name Here", // Why needed? Another query to just fetch this? :(
          current_quantity: quantity,
        };
        await stockOwnedRepository.save(newOwnedStock);
      }
    } catch (error) {
      throw new Error("Error checking or updating user's owned stock (placeMarketBuyOrder)");
    }
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
   * @param {string} user_name - The name of the user who placed placed the original stock transaction
   *
   * @throws {Error} - Throws error if the transaction cannot be found or canceled.
   */
  cancelStockTransaction: async (stock_tx_id: string, user_name: string) => {
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
      transaction = { ...transaction, order_status: ORDER_STATUS.CANCELLED };
      transaction = await stockTransactionRepository.save(transaction);
    } catch (error) {
      throw new Error(
        "Error with updating limit sell order's status to CANCELLED (callStockTransaction)"
      );
    }

    try {
      // Check if user owns stock already
      let ownedStock: StockOwned | null = await stockOwnedRepository
        .search()
        .where("stock_id")
        .equals(transaction.stock_tx_id)
        .and("user_name")
        .equals(user_name)
        .returnFirst();

      if (ownedStock) {
        ownedStock = {
          ...ownedStock,
          current_quantity: ownedStock.current_quantity + transaction.quantity,
        };
        await stockOwnedRepository.save(ownedStock);
      } else {
        // If the user does not currently have the stock in portfolio (b/c when you create a sellOrder it removed it from portfolio)
        let newOwnedStock: StockOwned = {
          stock_id: transaction.stock_id,
          user_name,
          stock_name: "Stock Name Here", // Why needed? Another query just fetch this? :(
          current_quantity: transaction.quantity,
        };
        newOwnedStock = await stockOwnedRepository.save(newOwnedStock);
      }
    } catch (error) {
      throw new Error("Error checking or updating user's owned stock (placeMarketBuyOrder)");
    }
  },

  /**
   * Handles fulfillment of a sell order both partially or complete. This includes updating the parent transaction
   * to 'PARTIALLY_COMPLETED', creating a new COMPLETED transaction for the partial sale, and adjusting
   * the seller's wallet balance accordingly (adds sold amount to balance).
   *
   * NOTE: The partial sell may or may not be the last sell. If it is last, then we also need to
   *       mark the main parent sell (i.e. the transaction with `stock_tx_id`) to be completed.
   *
   * @param {string} stock_id - The ID of the stock being sold.
   * @param {number} sold_quantity - The quantity of stock that was sold at this time
   * @param {number} remaining_quantity - The quantity of stock still queued in the Matching Engine
   * @param {number} price - The price at which the partial sale occurs.
   * @param {string} stock_tx_id - The **parent** transaction ID of the original sell order.
   * @param {string} user_name - The name of the user who placed the original sell order.
   *
   * @throws {Error} - Throws error if there is an issue with updating transactions, wallet balance, or fetching user data.
   *
   */
  updateSale: async (
    stock_id: string,
    sold_quantity: number,
    remaining_quantity: number,
    price: number,
    stock_tx_id: string,
    user_name: string
  ) => {
    let parentTransaction: StockTransaction | null;
    try {
      parentTransaction = await stockTransactionRepository
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();
    } catch (error) {
      throw new Error("Error querying for the parent transaction");
    }

    if (!parentTransaction) {
      throw new Error(`Parent Transaction with id ${stock_tx_id} does not exist (updateSells)`);
    }

    const isComplete = remaining_quantity === 0;
    const isPartial = sold_quantity !== parentTransaction.quantity;
    const walletTxId = crypto.randomUUID();
    const partialSellTxId = crypto.randomUUID();

    let committedPartialSellTx: StockTransaction | null = null;
    if (isPartial) {
      parentTransaction = { ...parentTransaction, order_status: ORDER_STATUS.PARTIALLY_COMPLETED };

      // Creates a new transaction with the parent_stock_tx_id linking to the original limit sell transaction with status COMPLETED
      try {
        committedPartialSellTx = await stockTransactionRepository.save({
          stock_tx_id: partialSellTxId,
          parent_tx_id: stock_tx_id,
          stock_id: stock_id,
          wallet_tx_id: walletTxId, // Optimistically include wallet transaction id
          order_status: ORDER_STATUS.COMPLETED,
          is_buy: true,
          order_type: ORDER_TYPE.MARKET,
          stock_price: price,
          quantity: sold_quantity,
          time_stamp: new Date(),
          user_name,
        });
      } catch (error) {
        throw new Error(
          "Error creating a new partial complete transaction for seller (partialSell)"
        );
      }
    } // if - isPartial

    // Must check `isComplete` after checking `isPartial` b/c
    // we overwrites the partially completed status to complete
    if (isComplete) {
      parentTransaction = { ...parentTransaction, order_status: ORDER_STATUS.COMPLETED };
    }

    // Add whatever the sold amount was to the wallet. No distinction between partial and complete
    // needs to be made since this amount is whatever that has been just sold.
    const relatedStockTx = isPartial ? committedPartialSellTx! : parentTransaction;
    const amount: number = price * sold_quantity; // amount not provided by the matching-engine
    try {
      await walletTransactionRepository.save({
        wallet_tx_id: walletTxId,
        stock_tx_id: relatedStockTx.stock_tx_id,
        is_debit: false,
        amount,
        time_stamp: new Date(),
        user_name,
      });
    } catch (error) {
      // Rollback the optimistic wallet tx ID in the new stock transaction
      try {
        stockTransactionRepository.save({ ...relatedStockTx, wallet_tx_id: null });
      } catch (err) {
        throw new Error(
          `Failed to rollback optimistic wallet ID in stock transaction ${relatedStockTx.stock_tx_id}`
        );
      }
    }

    // Updates the seller's wallet to match the latest wallet transaction
    try {
      const user: User | null = await userRepository
        .search()
        .where("user_name")
        .equals(user_name)
        .returnFirst();

      if (!user) throw new Error("Error finding user (updateSales)");

      user.wallet_balance += amount;
      await userRepository.save(user);
    } catch (error) {
      throw new Error("Error updating the wallet of the limit sell user (updateSales)");
    }
  },
};

export default service;
