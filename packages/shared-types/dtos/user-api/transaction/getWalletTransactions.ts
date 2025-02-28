import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../..";

export type GetWalletTransactionsResponse = ReturnType<
  {
    wallet_tx_id: string;
    stock_tx_id: string;
    is_debit: boolean;
    amount: number;
    time_stamp: string;
  }[]
>;
export function isGetWalletTransactionsResponse(obj: any): obj is GetWalletTransactionsResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => {
      isObject(item) &&
        "wallet_tx_id" in item &&
        typeof item.wallet_tx_id === "string" &&
        "stock_tx_id" in item &&
        typeof item.stock_tx_id === "string" &&
        "is_debit" in item &&
        typeof item.is_debit === "boolean" &&
        "amount" in item &&
        typeof item.amount === "number" &&
        "time_stamp" in item &&
        typeof item.time_stamp === "string";
    })
  );
}
