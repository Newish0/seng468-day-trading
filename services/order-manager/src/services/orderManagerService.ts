import { EntityId, Repository } from "redis-om";
import { RedisInstance } from "shared-models/RedisInstance";
import type { Stock, StockOwned, StockTransaction } from "shared-models/redisSchema";
import {
  ownedStockSchema,
  StockTransactionSchema,
  userSchema,
  stockSchema,
} from "shared-models/redisSchema";
import type {
  CancelSellRequest,
  LimitSellOrderRequest,
  MarketBuyRequest,
} from "shared-types/dtos/order-service/orderRequests";
import { ORDER_STATUS, ORDER_TYPE } from "shared-types/transactions";
import type { User } from "shared-types/user";
import { publishToQueue } from "./rabbitMQService";

const LIMIT_SELL_ROUTING_KEY = "order.limit_sell";
const MARKET_BUY_ROUTING_KEY = "order.market_buy";
const CANCEL_SELL_ROUTING_KEY = "order.limit_sell_cancellation";

const stockNameCache: Map<string, string> = new Map();

const redisConnection: RedisInstance = new RedisInstance();
redisConnection.connect();

const stockTransactionRepository: Repository<StockTransaction> =
  await redisConnection.createRepository(StockTransactionSchema);

const userRepository: Repository<User> = await redisConnection.createRepository(userSchema);

const stockOwnedRepository: Repository<StockOwned> = await redisConnection.createRepository(
  ownedStockSchema
);

const stockRepository: Repository<Stock> = await redisConnection.createRepository(stockSchema);

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
    let userData: User | null; // contains user info from database
    let stock_name: string;
    let ownedStock: StockOwned | null;
    const txId = crypto.randomUUID();
    try {
      userData = await userRepository.search().where("user_name").equals(user_name).returnFirst();
      if (!userData) throw new Error("Error finding user (placeLimitSellOrder)");
    } catch (err) {
      throw new Error("Error fetching user data from database (Limit Sell Order)");
    }

    if (stockNameCache.has(stock_id)) {
      stock_name = stockNameCache.get(stock_id)!;
    } else {
      try {
        const stock = await stockRepository
          .search()
          .where("stock_id")
          .equals(stock_id)
          .returnFirst();
        if (!stock) throw new Error("Invalid stock_id (placeLimitSellOrder)");
        stock_name = stock.stock_name;
        stockNameCache.set(stock_id, stock_name);
      } catch (err) {
        throw new Error("Error fetching stock name (placeLimitSellOrder)");
      }
    }

    // Initializes limit sell request to request the matching-engine
    const limitSellRequest: LimitSellOrderRequest = {
      stock_id,
      stock_name,
      quantity,
      price,
      stock_tx_id: txId,
      user_name,
    };

    // Constructs a limit sell transaction
    let transaction: StockTransaction = {
      user_name,
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

    try {
      ownedStock = await stockOwnedRepository
        .search()
        .where("stock_id")
        .equals(stock_id)
        .and("user_name")
        .equals(user_name)
        .returnFirst();
      if (!ownedStock) {
        const transactionEntityId = transaction[EntityId];
        if (transactionEntityId) await stockTransactionRepository.remove(transactionEntityId);
        throw new Error("User does not own this stock (placeLimitSellOrder)");
      }
    } catch (err) {
      throw new Error("Error fetching owned stock data from database");
    }

    if (ownedStock.current_quantity < quantity) {
      const transactionEntityId = transaction[EntityId];
      if (transactionEntityId) await stockTransactionRepository.remove(transactionEntityId);
      throw new Error(
        `Insufficient shares. You currently own ${ownedStock.current_quantity} shares, but attempted to sell ${quantity} shares. (placeLimitSellOrder)`
      );
    }

    try {
      await publishToQueue(LIMIT_SELL_ROUTING_KEY, limitSellRequest);
    } catch (error) {
      console.error("Failed to publish limit sell order:", error); // for debug
      throw error;
    }

    if (ownedStock.current_quantity - quantity >= 0) {
      ownedStock = { ...ownedStock, current_quantity: ownedStock.current_quantity - quantity };
      try {
        await stockOwnedRepository.save(ownedStock);
      } catch (err) {
        throw new Error("Error updating owned stock quantity in database");
      }
    }
  },

  /**
   * Places a market buy order by sending a request to the matching engine,

   *
   * @param {string} stock_id - The ID of the stock being purchased.
   * @param {number} quantity - The number of shares to buy.
   * @param {string} user_name - The name of the user placing the buy order.
   *
   * @throws {Error} - Throws error if there is an issue fetching user data, or with sending message into the queue
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

    if (userData.wallet_balance <= 0)
      throw new Error(`The user does not have any money: $${userData.wallet_balance}`);

    // TODO: Lock funds here

    const buyTxId = crypto.randomUUID();

    // New buyer transaction that has NOT been approved by Matching Engine yet
    let new_user_transaction: StockTransaction = {
      user_name,
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

    // Stores new transaction before approval by M.E
    try {
      new_user_transaction = await stockTransactionRepository.save(new_user_transaction);
    } catch (error) {
      throw new Error("Error storing new_user_transaction for buyer (placeMarketBuyOrder)");
    }

    const marketBuyRequest: MarketBuyRequest = {
      stock_id,
      quantity,
      stock_tx_id: new_user_transaction.stock_tx_id,
      budget: userData.wallet_balance,
      user_name,
    };

    try {
      await publishToQueue(MARKET_BUY_ROUTING_KEY, marketBuyRequest);
    } catch (error) {
      console.error("Failed to publish market buy order:", error); // for debug
      throw error;
    }
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
      // Get root most transaction
      while (true) {
        transaction = await stockTransactionRepository
          .search()
          .where("stock_tx_id")
          .equals(stock_tx_id)
          .returnFirst();

        if (transaction && transaction.parent_tx_id) {
          stock_tx_id = transaction.parent_tx_id;
        } else {
          break;
        }
      }
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

    try {
      await publishToQueue(CANCEL_SELL_ROUTING_KEY, cancelSellRequest);
    } catch (error) {
      console.error("Failed to publish cancel sell order:", error); // for debug
      throw error;
    }
  },
};

export default service;
