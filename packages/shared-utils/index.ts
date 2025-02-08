import { validator } from "hono/validator";

export function getValidator(fn: (value: any) => boolean) {
  return validator("json", (value, c) => {
    if (!fn(value)) {
      return c.json({ success: false, data: null }, 400);
    }
    return {
      body: value,
    };
  });
}
