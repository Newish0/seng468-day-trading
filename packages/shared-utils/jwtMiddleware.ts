import { type Context, type Next } from "hono";
import { verify } from "hono/jwt";
import { handleError } from ".";

// JWT Middleware
export const jwtAuthorize = async (c: Context, next: Next) => {
  try {
    const tokenToVerify = c.req.header("token");

    if (!tokenToVerify) {
      return handleError(c, new Error("Token not included"), "Token not included", 401);
    }

    let payload = null;
    try {
      payload = await verify(tokenToVerify, Bun.env.JWT_SECRET || "secret");
    } catch (err) {
      return handleError(c, new Error("Invalid token included"), "Invalid token included", 401);
    }

    c.set("user", payload);

    return await next();
  } catch (error) {
    return handleError(c, error, "An unknown error has occured with token authorization");
  }
};
