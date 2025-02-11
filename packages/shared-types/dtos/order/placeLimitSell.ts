import { isValidReturnType, type ReturnType } from "..";
import { isObject } from "../..";

export type PlaceLimitSellRequest = {
  stock_id: string;
  quantity: number;
  price: number;
  user_name: string;
};
export function isPlaceLimitSellRequest(obj: any): obj is PlaceLimitSellRequest {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "quantity" in obj &&
    typeof obj.quantity === "number" &&
    "price" in obj &&
    typeof obj.price === "number" &&
    "user_name" in obj &&
    typeof obj.user_name === "string"
  );
}

export type PlaceLimitSellResponse = ReturnType<void>;
export function isPlaceLimitSellResponse(obj: any): obj is PlaceLimitSellResponse {
  return isValidReturnType(obj);
}
