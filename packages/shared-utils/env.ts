export function getEnvVariable(key: string, defaultValue: string = ""): string {
  if (typeof Bun !== "undefined" && Bun.env) {
    return Bun.env[key] || defaultValue;
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[`VITE_${key}`] || defaultValue;
  }
  return defaultValue;
}
