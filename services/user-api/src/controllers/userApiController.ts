import type { Context } from "hono";

const controller = {
  helloWorld: async (c: Context) => {
    return c.json({ message: "Hello, world!" });
  },
};

export default controller;
