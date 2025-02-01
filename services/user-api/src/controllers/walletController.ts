import type { AddMoneyToWalletRequest } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
import { type ContextWithUser, type WrappedInput } from "shared-types/hono";
import userService from "../services/userService";
import walletService from "../services/walletService";

const walletController = {
  getWalletBalance: async (c: ContextWithUser) => {
    const userId = c.get("user");
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: { balance: user.walletBalance } });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  getWalletTransactions: async (c: ContextWithUser) => {
    const userId = c.get("user");
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: user.walletTransactions });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  addMoneyToWallet: async (
    c: ContextWithUser<WrappedInput<AddMoneyToWalletRequest>>
  ) => {
    const userId = c.get("user");
    const { amount } = c.req.valid("json");
    try {
      walletService.addMoneyToWallet(userId, amount);
      return c.json({ success: true, data: null });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
};

export default walletController;
