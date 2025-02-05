import { isValidReturnType, type ReturnType } from "../..";
import { isAvailableStock, type AvailableStock } from "../../../stocks";

export type GetStockPricesRequest = void;

export type GetStockPricesResponse = ReturnType<AvailableStock[]>;
export function isGetStockPricesResponse(obj: any): obj is GetStockPricesResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => isAvailableStock(item))
  );
}
