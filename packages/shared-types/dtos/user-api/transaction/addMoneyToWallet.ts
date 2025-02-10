import { isValidReturnType, type ReturnType } from "../..";
import { isObject } from "../../../index";

export type AddMoneyToWalletRequest = {
  amount: number;
};
export function isAddMoneyToWalletRequest(
  obj: any
): obj is AddMoneyToWalletRequest {
  return isObject(obj) && "amount" in obj && typeof obj.amount === "number";
}

export type AddMoneyToWalletResponse = ReturnType<void>;
export function isAddMoneyToWalletResponse(
  obj: any
): obj is AddMoneyToWalletResponse {
  return isValidReturnType(obj);
}
