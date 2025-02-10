import { isValidReturnType, type ReturnType } from "../..";
import {
  isWalletTransaction,
  type WalletTransaction,
} from "../../../transactions";

export type GetWalletTransactionsResponse = ReturnType<WalletTransaction[]>;
export function isGetWalletTransactionsResponse(
  obj: any
): obj is GetWalletTransactionsResponse {
  return (
    isValidReturnType(obj) &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => isWalletTransaction(item))
  );
}
