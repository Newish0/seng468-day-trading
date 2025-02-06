import { isValidReturnType, type ReturnType } from "../..";
import {
  isStockTransaction,
  type StockTransaction,
} from "../../../transactions";

export type GetStockTransactionsResponse = ReturnType<StockTransaction[]>;
export function isGetStockTransactionsResponse(
  obj: any
): obj is GetStockTransactionsResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => isStockTransaction(item))
  );
}
