import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";

export type AddStockToUserRequest = {
  stock_id: string;
  quantity: number;
};
export function isAddStockToUserRequest(obj: any): obj is AddStockToUserRequest {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "quantity" in obj &&
    typeof obj.quantity === "number"
  );
}

export type AddStockToUserResponse = ReturnType<null>;
