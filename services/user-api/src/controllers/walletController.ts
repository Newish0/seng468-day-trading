import type { AddMoneyToWalletRequest } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
import { type ContextWithUser, type WrappedInput } from "shared-types/hono";
import userService from "../services/userService";
import walletService from "../services/walletService";

const walletController = {
  getWalletBalance: async (c: ContextWithUser) => {
    const userId = c.get("user");
    try {
      const user = await userService.getUserFromId(userId);
      return c.json({ success: true, data: { balance: user.wallet_balance } });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  getWalletTransactions: async (c: ContextWithUser) => {
    const userId = c.get("user");
    try {
      const userWalletTransactions = await walletService.getUserWalletTransactions(userId);
      const userWalletTransactionsFormatted = userWalletTransactions.map((transaction) => ({
        wallet_tx_id: transaction.wallet_tx_id,
        stock_tx_id: transaction.stock_tx_id,
        is_debit: transaction.is_debit,
        amount: transaction.quantity,
        time_stamp: transaction.time_stamp,
      }));
      return c.json({ success: true, data: userWalletTransactionsFormatted });
    } catch (e) {
      return c.json({ success: false, data: null }, 500);
    }
  },
  addMoneyToWallet: async (c: ContextWithUser<WrappedInput<AddMoneyToWalletRequest>>) => {
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
