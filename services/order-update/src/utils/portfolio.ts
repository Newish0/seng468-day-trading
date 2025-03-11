import type { RedisClientType } from "redis";
import { EntityId, type Repository } from "redis-om";
import { ownedStockAtomicUpdate } from "shared-models/redisRepositoryHelper";
import type { Stock, StockOwned } from "shared-models/redisSchema";
import { createClient } from "redis";
import { db } from "shared-models/newDb";

export async function createAddQtyToOwnedStock(
  stockId: string,
  userName: string,
  qtyToAdd: number,
  stockOwnedRepo: Repository<StockOwned>,
  stockRepo: Repository<Stock>,
  redis: ReturnType<typeof createClient>
) {
  try {
    const ownedStock: StockOwned | null = await db.ownedStockRepo
      .search()
      .where("stock_id")
      .equals(stockId)
      .and("user_name")
      .equals(userName)
      .returnFirst();

    // Update current quantity of owned stock if user already owns the stock (exist in portfolio)
    // Otherwise, add new owned stock (needed for the return quantity)
    if (ownedStock) {
      const success = await ownedStockAtomicUpdate(redis, ownedStock[EntityId]!, qtyToAdd);

      if (!success) {
        throw new Error("Error updating user's owned stock (createAddQtyToOwnedStock)");
      }
    } else {
      const stock = await db.stockRepo.search().where("stock_id").equals(stockId).returnFirst();
      if (!stock) {
        throw new Error("Error fetching stock record (createAddQtyToOwnedStock)");
      }

      await db.ownedStockRepo.save({
        stock_id: stockId,
        user_name: userName,
        stock_name: stock.stock_name,
        current_quantity: qtyToAdd,
      });
    }
  } catch (error) {
    throw new Error("Error checking or updating user's owned stock (createAddQtyToOwnedStock)", {
      cause: error,
    });
  }
}
