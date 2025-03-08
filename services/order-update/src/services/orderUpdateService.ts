import { createAddQtyToOwnedStock } from "@/utils/portfolio";
import { EntityId } from "redis-om";
import { type StockTransaction, type User } from "shared-models/redisSchema";
import {
  unlockUserWallet,
  userWalletAtomicUpdate,
  userWalletDeductAndUnlockAtomicUpdate,
} from "shared-models/redisRepositoryHelper";
import { ORDER_STATUS, ORDER_TYPE } from "shared-types/transactions";

import { db, connOwnedStock, connWalletTx, connUser } from "shared-models/newDb";

export default {
  handleSaleUpdate: async ({
    stock_id,
    sold_quantity,
    remaining_quantity,
    price,
    stock_tx_id,
    user_name,
  }: {
    stock_id: string;
    sold_quantity: number;
    remaining_quantity: number;
    price: number;
    stock_tx_id: string;
    user_name: string;
  }) => {
    let parentTransaction: StockTransaction | null;
    try {
      parentTransaction = await db.stockTxRepo
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();
    } catch (error) {
      throw new Error("Error querying for the parent transaction", {
        cause: error,
      });
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
        committedPartialSellTx = await db.stockTxRepo.save({
          stock_tx_id: partialSellTxId,
          parent_tx_id: stock_tx_id,
          stock_id: stock_id,
          wallet_tx_id: walletTxId, // Optimistically include wallet transaction id
          order_status: ORDER_STATUS.COMPLETED,
          is_buy: false,
          order_type: ORDER_TYPE.LIMIT,
          stock_price: price,
          quantity: sold_quantity,
          time_stamp: new Date(),
          user_name,
        });
      } catch (error) {
        throw new Error(
          "Error creating a new partial complete transaction for seller (partialSell)",
          {
            cause: error,
          }
        );
      }
    } // if - isPartial

    // Must check `isComplete` after checking `isPartial` b/c
    // we overwrites the partially completed status to complete
    if (isComplete) {
      parentTransaction = { ...parentTransaction, order_status: ORDER_STATUS.COMPLETED };
    }

    // Update the parent transaction
    try {
      await db.stockTxRepo.save(parentTransaction);
    } catch (error) {
      throw new Error("Error updating parent transaction (updateSales)", {
        cause: error,
      });
    }

    // Add whatever the sold amount was to the wallet. No distinction between partial and complete
    // needs to be made since this amount is whatever that has been just sold.
    const relatedStockTx = isPartial ? committedPartialSellTx! : parentTransaction;
    const amount: number = price * sold_quantity; // amount not provided by the matching-engine
    try {
      await db.walletTxRepo.save({
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
        db.stockTxRepo.save({ ...relatedStockTx, wallet_tx_id: null });
      } catch (err) {
        throw new Error(
          `Failed to rollback optimistic wallet ID in stock transaction ${relatedStockTx.stock_tx_id}`,
          {
            cause: err,
          }
        );
      }
    }

    // Updates the seller's wallet to match the latest wallet transaction
    try {
      const user: User | null = await db.userRepo
        .search()
        .where("user_name")
        .equals(user_name)
        .returnFirst();

      if (!user) throw new Error("Error finding user (updateSales)");

      const success = await userWalletAtomicUpdate(connUser, user[EntityId]!, amount);

      if (!success)
        throw new Error("Error updating the wallet of the limit sell user (updateSales)");
    } catch (error) {
      throw new Error("Error updating the wallet of the limit sell user (updateSales)", {
        cause: error,
      });
    }
  },

  handleBuyCompletion: async ({
    price_total,
    quantity,
    stock_id,
    stock_tx_id,
  }: {
    stock_id: string;
    stock_tx_id: string;
    quantity: number;
    price_total: number;
  }) => {
    // Find the original stock order transaction
    let oriStockTx: StockTransaction | null = null;
    try {
      oriStockTx = await db.stockTxRepo
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();
    } catch (error) {
      throw new Error("Error querying for the original stock transaction (handleBuyCompletion)", {
        cause: error,
      });
    }

    if (!oriStockTx) {
      throw new Error(
        `Original Stock Transaction with id ${stock_tx_id} does not exist (handleBuyCompletion)`
      );
    }

    // Create wallet transaction for buyer for the fund deduction
    const walletTxId = crypto.randomUUID();
    try {
      await db.walletTxRepo.save({
        wallet_tx_id: walletTxId,
        stock_tx_id: stock_tx_id,
        is_debit: true,
        amount: price_total,
        time_stamp: new Date(),
        user_name: oriStockTx.user_name,
      });
    } catch (error) {
      throw new Error("Error creating new wallet transaction (handleBuyCompletion)", {
        cause: error,
      });
    }

    // Update the original stock transaction to mark as completed with latest data
    try {
      oriStockTx = await db.stockTxRepo.save({
        ...oriStockTx,
        order_status: ORDER_STATUS.COMPLETED,
        stock_price: price_total / quantity, // Avg price per share
        wallet_tx_id: walletTxId,
      });
    } catch (error) {
      throw new Error(
        "Error updating the original stock transaction for buyer (handleBuyCompletion)",
        {
          cause: error,
        }
      );
    }

    // Add stock to user portfolio.
    // NOTE: This must be called before we unlock the user's wallet to avoid race conditions.
    //       This is because the moment we unlock the user's wallet, they can buy more stocks.
    await createAddQtyToOwnedStock(
      oriStockTx.stock_id,
      oriStockTx.user_name,
      quantity,
      db.ownedStockRepo,
      db.stockRepo,
      connOwnedStock
    );

    const user = await (async () => {
      try {
        const user = await db.userRepo
          .search()
          .where("user_name")
          .equals(oriStockTx.user_name)
          .returnFirst();
        if (!user) throw new Error("Error finding user (handleBuyCompletion)");
        return user;
      } catch (error) {
        throw new Error("Error querying for user (handleBuyCompletion)", {
          cause: error,
        });
      }
    })();

    // Deduct money from the user's wallet and unlock atomically
    // NOTE: Must unlock after deducting to avoid race conditions. So
    //       we are forced to perform the deduct and unlock in one atomic operation.
    const walletAndUnlockSuccess = await (async () => {
      try {
        return await userWalletDeductAndUnlockAtomicUpdate(connUser, user[EntityId]!, price_total);
      } catch (error) {
        throw new Error(
          "Error updating buyer wallet or unlock for buy order(handleBuyCompletion)",
          {
            cause: error,
          }
        );
      }
    })();

    if (!walletAndUnlockSuccess) {
      throw new Error("Error updating buyer wallet for buy order(handleBuyCompletion)");
    }
  },

  handleFailedBuyCompletion: async ({ stock_tx_id }: { stock_tx_id: string }) => {
    // Find the original stock order transaction
    let oriStockTx: StockTransaction | null = null;
    try {
      oriStockTx = await db.stockTxRepo
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();
    } catch (error) {
      throw new Error(
        "Error querying for the original stock transaction (handleFailedBuyCompletion)",
        {
          cause: error,
        }
      );
    }

    if (!oriStockTx) {
      throw new Error(
        `Original Stock Transaction with id ${stock_tx_id} does not exist (handleFailedBuyCompletion)`
      );
    }

    // Update the original stock transaction to mark as failed
    db.stockTxRepo.save({
      ...oriStockTx,
      order_status: ORDER_STATUS.FAILED,
    });

    const user = await db.userRepo
      .search()
      .where("user_name")
      .equals(oriStockTx.user_name)
      .returnFirst();

    if (!user) {
      throw new Error("Error finding user (handleFailedBuyCompletion)");
    }

    await unlockUserWallet(db.userRepo, user[EntityId]!);
  },

  handleCancellation: async ({
    stock_tx_id,
    cur_quantity,
  }: {
    stock_tx_id: string; // This is the root most transaction
    cur_quantity: number;
  }) => {
    let transaction: StockTransaction | null = null;
    try {
      transaction = await db.stockTxRepo
        .search()
        .where("stock_tx_id")
        .equals(stock_tx_id)
        .returnFirst();
    } catch (error) {
      throw new Error("Error querying for the original stock transaction (handleCancellation)", {
        cause: error,
      });
    }

    if (!transaction) {
      throw new Error(
        `Stock Transaction with id ${stock_tx_id} does not exist (handleCancellation)`
      );
    }

    // Modify the cancelled limit sell transaction to status="CANCELLED"
    try {
      transaction = await db.stockTxRepo.save({
        ...transaction,
        order_status: ORDER_STATUS.CANCELLED,
      });
    } catch (error) {
      throw new Error(
        "Error with updating limit sell order's status to CANCELLED (handleCancellation)"
      );
    }

    // Return the quantity that has NOT been sold back to the user
    await createAddQtyToOwnedStock(
      transaction.stock_id,
      transaction.user_name,
      cur_quantity,
      db.ownedStockRepo,
      db.stockRepo,
      connOwnedStock
    );
  },
};
