import { isValidReturnType, type ReturnType } from "..";
import { isObject } from "../..";

export type PlaceLimitSellRequest = {
  stock_id: string;
  quantity: number;
  price: number;
};
export function isPlaceLimitSellRequest(
  obj: any
): obj is PlaceLimitSellRequest {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "quantity" in obj &&
    typeof obj.quantity === "number" &&
    "price" in obj &&
    typeof obj.price === "number"
  );
}

export type PlaceLimitSellResponse = ReturnType<void>;
export function isPlaceLimitSellResponse(
  obj: any
): obj is PlaceLimitSellResponse {
  return isValidReturnType(obj);
}
