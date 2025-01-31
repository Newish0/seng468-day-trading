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
    c.status(400);
    return c.json({ message: "Not implemented" });
  },
  addMoneyToWallet: async <
    E extends Env,
    P extends string,
    I extends WrappedInput<AddMoneyToWalletRequest>
  >(
    c: Context<E, P, I>
  ) => {
    const v = c.req.valid("json");
    walletService.addMoneyToWallet(v.amount);
    return c.json({}, 200);
  },
};

export default walletController;
