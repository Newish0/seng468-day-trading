import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";

export type GetStockPortfolioResponse = ReturnType<
  {
    stock_id: string;
    stock_name: string;
    quantity_owned: number;
  }[]
>;
export function isGetStockPortfolioResponse(obj: any): obj is GetStockPortfolioResponse {
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
        "quantity_owned" in item &&
        typeof item.quantity_owned === "number"
    )
  );
}
