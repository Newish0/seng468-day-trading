import { type Context, type Next } from "hono";
import { verify } from "hono/jwt";

// JWT Middleware
export const jwtAuthorize = async (c: Context, next: Next) => {
  try {
    const tokenToVerify = c.req.header("token");

    if (!tokenToVerify) {
      return c.json({ success: false, data: { error: "Token not included" } }, 401);
    }

    let payload = null;
    try {
      payload = await verify(tokenToVerify, Bun.env.JWT_SECRET || "secret");
    } catch (err) {
      return c.json({ success: false, data: { error: "Invalid credentials" } }, 401);
    }

    c.set("user", payload);

    return await next();
  } catch (error) {
    return c.json({ success: false, data: { error: "Invalid token" } }, 401);
  }
};
