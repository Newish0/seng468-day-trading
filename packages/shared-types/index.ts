export function isObject(obj: any): obj is object {
  return typeof obj === "object" && obj !== null;
}
