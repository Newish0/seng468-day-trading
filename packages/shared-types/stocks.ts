import { isObject } from ".";

export type OwnedStock = {
  stock_id: string;
  stock_name: string;
  quantity_owned: number;
  user_name: string;
};
export function isOwnedStock(obj: any): obj is OwnedStock {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "stock_name" in obj &&
    typeof obj.stock_name === "string" &&
    "quantity_owned" in obj &&
    typeof obj.quantity_owned === "number"
  );
}

export type AvailableStock = {
  stock_id: string;
  stock_name: string;
  current_price: number;
};
export function isAvailableStock(obj: any): obj is AvailableStock {
  return (
    isObject(obj) &&
    "stock_id" in obj &&
    typeof obj.stock_id === "string" &&
    "stock_name" in obj &&
    typeof obj.stock_name === "string" &&
    "current_price" in obj &&
    typeof obj.current_price === "number"
  );
}
