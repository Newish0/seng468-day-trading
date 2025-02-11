import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../../index";

export type GetWalletBalanceResponse = ReturnType<{ balance: number }>;
export function isGetWalletBalanceResponse(obj: any): obj is GetWalletBalanceResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    isObject(obj.data) &&
    "balance" in obj.data &&
    typeof obj.data.balance === "number"
  );
}
