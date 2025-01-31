import type { Context, Env } from "hono";
import type { AddMoneyToWalletRequest } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
import { type WrappedInput } from "shared-types/hono";
import userService from "../services/userService";
import walletService from "../services/walletService";

const walletController = {
  getWalletBalance: async (c: Context) => {
    // const userId = c.get("user");
    const userId = "1234";
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: { balance: user.walletBalance } });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  getWalletTransactions: async (c: Context) => {
    // const userId = c.get("user");
    const userId = "1234";
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: user.walletTransactions });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  addMoneyToWallet: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<AddMoneyToWalletRequest>
  >(
    c: Context<E, P, I>
  ) => {
    // const userId = c.get("user");
    const userId = "1234";
    const { amount } = c.req.valid("json");
    try {
      walletService.addMoneyToWallet(userId, amount);
      return c.json({ success: true, data: null }, 200);
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
};

export default walletController;
