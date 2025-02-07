import { isValidReturnType, type ReturnType } from "../..";
import { isOwnedStock, type OwnedStock } from "../../../stocks";

export type GetStockPortfolioResponse = ReturnType<OwnedStock[]>;
export function isGetStockPortfolioResponse(
  obj: any
): obj is GetStockPortfolioResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => isOwnedStock(item))
  );
}
