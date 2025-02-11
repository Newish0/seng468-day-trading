import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";

export type GetStockPricesResponse = ReturnType<
  {
    stock_id: string;
    stock_name: string;
    current_price: number;
  }[]
>;
export function isGetStockPricesResponse(obj: any): obj is GetStockPricesResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every(
      (item: any) =>
        isObject(item) &&
        "stock_id" in item &&
        typeof item.stock_id === "string" &&
        "stock_name" in item &&
        typeof item.stock_name === "string" &&
        "current_price" in item &&
        typeof item.current_price === "number"
    )
  );
}
