import type { Context } from "hono";

const walletController = {
  getWalletBalance: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  getWalletTransactions: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  addMoneyToWallet: async (c: Context) => {
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
};

export default walletController;
