import { type Context, type Next } from "hono";
import { verify } from "hono/jwt";

// JWT Middleware
export const jwtAuthorize = async (c: Context, next: Next) => {
  try {
    const tokenToVerify = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!tokenToVerify) {
      return c.json({ message: "Token not included" }, 401); 
    }

    let payload = null;
    try {
      payload = await verify(tokenToVerify, Bun.env.JWT_SECRET || "secret");
    } catch (err) {
      return c.json({ message: "Invalid credentials" }, 401); 
    }

    c.set("user", payload);

    return await next(); 
  } catch (error) {
    return c.json({ message: "Invalid token" }, 401); 
  }
}




