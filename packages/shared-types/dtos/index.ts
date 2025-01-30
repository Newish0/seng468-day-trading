import { isObject } from "../index";

export type ReturnType<T> = {
  success: boolean;
  data: T;
};
export function isValidReturnType(obj: any): obj is ReturnType<any> {
  return isObject(obj) && "success" in obj && typeof obj.success === "boolean";
}
