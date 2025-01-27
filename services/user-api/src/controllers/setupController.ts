import type { Context } from "hono";

const setupController = {
  createStock: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default setupController;
