import { isValidReturnType, type ReturnType } from "..";
import { isObject } from "../..";

export type PlaceMarketBuyRequest = {
  stock_id: string;
  quantity: number;
};
export function isPlaceMarketBuyRequest(
  obj: any
): obj is PlaceMarketBuyRequest {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "quantity" in obj &&
    typeof obj.quantity === "number"
  );
}

export type PlaceMarketBuyResponse = ReturnType<void>;
export function isPlaceMarketBuyResponse(
  obj: any
): obj is PlaceMarketBuyResponse {
  return isValidReturnType(obj);
}
