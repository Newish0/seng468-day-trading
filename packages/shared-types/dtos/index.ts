import { isObject } from "../index";

export type ReturnType<T> = {
  success: boolean;
  data: T;
};
export function isValidReturnType(obj: any): obj is ReturnType<any> {
  return isObject(obj) && "success" in obj && typeof obj.success === "boolean";
}

// Request types

export type FetchOptions<TBody> = {
  headers?: Record<string, string>;
  body: TBody;
};
export type Endpoint = {
  path: string;
  requestMethod: "GET" | "POST" | "PUT" | "DELETE";
};
export type InternalResponse<T> =
  | {
      success: true;
      status: number;
      data: T;
    }
  | {
      success: false;
      status: number;
      error: string;
    };
