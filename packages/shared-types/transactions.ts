export enum ORDER_STATUS {
  PENDING = "PENDING",
  PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  IN_PROGRESS = "IN_PROGRESS",
  FAILED = "FAILED",
}
export function isValidOrderStatus(obj: any): obj is ORDER_STATUS {
  return (
    obj === ORDER_STATUS.PENDING ||
    obj === ORDER_STATUS.PARTIALLY_COMPLETED ||
    obj === ORDER_STATUS.COMPLETED
  );
}

export enum ORDER_TYPE {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}
export function isValidOrderType(obj: any): obj is ORDER_TYPE {
  return obj === ORDER_TYPE.MARKET || obj === ORDER_TYPE.LIMIT;
}
