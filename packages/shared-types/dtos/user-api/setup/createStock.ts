import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";

export type CreateStockRequest = {
  stock_name: string;
};
export function isCreateStockRequest(obj: any): obj is CreateStockRequest {
  return (
    isObject(obj) && "stock_name" in obj && typeof obj.stock_name === "string"
  );
}

export type CreateStockResponse = ReturnType<{ stock_id: string }>;
export function isCreateStockResponse(obj: any): obj is CreateStockResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    isObject(obj.data) &&
    "stock_id" in obj.data &&
    typeof obj.data.stock_id === "string"
  );
}
