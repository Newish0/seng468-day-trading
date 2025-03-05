import type { Repository } from "redis-om";
import { type Stock } from "shared-models/redisSchema";

const stockNameCache: Map<string, string> = new Map();

export async function getStockName(
  stock_id: string,
  stockRepo: Repository<Stock>
): Promise<string> {
  if (stockNameCache.has(stock_id)) {
    return stockNameCache.get(stock_id)!;
  } else {
    try {
      const stock = await stockRepo.search().where("stock_id").equals(stock_id).returnFirst();
      if (!stock) throw new Error(`Invalid stock_id: ${stock_id}`);
      const stock_name = stock.stock_name;
      stockNameCache.set(stock_id, stock_name);
      return stock_name;
    } catch (err) {
      throw new Error(`Error fetching stock name for stock_id: ${stock_id}`);
    }
  }
}
