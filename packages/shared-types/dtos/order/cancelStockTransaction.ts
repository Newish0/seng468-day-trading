import { isValidReturnType, type ReturnType } from "..";
import { isObject } from "../..";

export type CancelStockTransactionRequest = {
  stock_tx_id: string;
};
export function isCancelStockTransactionRequest(
  obj: any
): obj is CancelStockTransactionRequest {
  return (
    isObject(obj) && "stock_tx_id" in obj && typeof obj.stock_tx_id === "string"
  );
}

export type CancelStockTransactionResponse = ReturnType<void>;
export function isCancelStockTransactionResponse(
  obj: any
): obj is CancelStockTransactionResponse {
  return isValidReturnType(obj);
}
