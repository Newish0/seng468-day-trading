import { EntityId, type Repository } from "redis-om";
import type { RedisInstance } from "shared-models/RedisInstance";
import { ownedStockAtomicUpdate } from "shared-models/redisRepositoryHelper";
import type { Stock, StockOwned } from "shared-models/redisSchema";

export async function createAddQtyToOwnedStock(
  stockId: string,
  userName: string,
  qtyToAdd: number,
  stockOwnedRepo: Repository<StockOwned>,
  stockRepo: Repository<Stock>,
  redis: RedisInstance
) {
  try {
    const ownedStock: StockOwned | null = await stockOwnedRepo
      .search()
      .where("stock_id")
      .equals(stockId)
      .and("user_name")
      .equals(userName)
      .returnFirst();

    // Update current quantity of owned stock if user already owns the stock (exist in portfolio)
    // Otherwise, add new owned stock (needed for the return quantity)
    if (ownedStock) {
      const success = await ownedStockAtomicUpdate(
        redis.getClient(),
        ownedStock[EntityId]!,
        qtyToAdd
      );

      if (!success) {
        throw new Error("Error updating user's owned stock (createAddQtyToOwnedStock)");
      }
    } else {
      const stock = await stockRepo.search().where("stock_id").equals(stockId).returnFirst();
      if (!stock) {
        throw new Error("Error fetching stock record (createAddQtyToOwnedStock)");
      }

      await stockOwnedRepo.save({
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
