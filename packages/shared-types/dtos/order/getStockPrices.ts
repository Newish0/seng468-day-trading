import { isValidReturnType, type ReturnType } from "..";

export type GetStockPricesRequest = void;
export function isGetStockPricesRequest(
  obj: any
): obj is GetStockPricesRequest {
  return obj === undefined;
}

export type GetStockPricesResponse = ReturnType<
  { stock_id: string; stock_name: string; current_price: number }[]
>;
export function isGetStockPricesResponse(
  obj: any
): obj is GetStockPricesResponse {
  return (
    isValidReturnType(obj) &&
    Array.isArray(obj.data) &&
    obj.data.every((stock: any) => {
      "stock_id" in stock &&
        typeof stock.stock_id === "string" &&
        "stock_name" in stock &&
        typeof stock.stock_name === "string" &&
        "current_price" in stock &&
        typeof stock.current_price === "number";
    })
  );
}
