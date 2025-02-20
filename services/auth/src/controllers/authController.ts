import service from "../services/authService";
import type { Context } from "hono";
import type { RegisterRequest, LoginRequest } from "shared-types/dtos/auth/auth";
import { handleError } from "shared-utils";

const controller = {
  register: async (c: Context) => {
    const { user_name, password, name }: Partial<RegisterRequest> = await c.req.json();

    if (!user_name || !password || !name) {
      return handleError(
        c,
        new Error("Invalid request body: Username, password, and name are required"),
        "Username, password, and name are required",
        400
      );
    }

    try {
      await service.register(user_name, password, name);
      return c.json({ success: true, data: null });
    } catch (error) {
      return handleError(c, error, "An unknown error has occured with registration");
    }
  },

  login: async (c: Context) => {
    const { user_name, password }: Partial<LoginRequest> = await c.req.json();

    if (!user_name || !password) {
      return handleError(
        c,
        new Error("Invalid request body: Username and password are required"),
        "Username and password are required",
        400
      );
    }

    try {
      const token = await service.login(user_name, password);
      return c.json({ success: true, data: token });
    } catch (error) {
      return handleError(c, error, "Incorrect username and/or password", 400);
    }
  },
};

export default controller;
