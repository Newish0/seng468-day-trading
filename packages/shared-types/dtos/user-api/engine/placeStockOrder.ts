import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";
import { isValidOrderType, type ORDER_TYPE } from "../../../transactions";

export type PlaceStockOrderRequest = {
  stock_id: string;
  is_buy: boolean;
  order_type: ORDER_TYPE;
  quantity: number;
  price: number;
};
export function isPlaceStockOrderRequest(obj: any): obj is PlaceStockOrderRequest {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "is_buy" in obj &&
    typeof obj.is_buy === "boolean" &&
    "order_type" in obj &&
    isValidOrderType(obj.order_type) &&
    "quantity" in obj &&
    typeof obj.quantity === "number" &&
    (obj.is_buy ? true : "price" in obj && typeof obj.price === "number")
  );
}

export type PlaceStockOrderResponse = ReturnType<void>;
export function isPlaceStockOrderResponse(obj: any): obj is PlaceStockOrderResponse {
  return isValidReturnType(obj);
}
