import type { AddMoneyToWalletRequest } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
import { type ContextWithUser, type WrappedInput } from "shared-types/hono";
import { handleError } from "shared-utils";
import userService from "../services/userService";
import walletService from "../services/walletService";

const walletController = {
  getWalletBalance: async (c: ContextWithUser) => {
    const { username } = c.get("user");
    try {
      const user = await userService.getUserFromId(username);
      return c.json({ success: true, data: { balance: user.wallet_balance } });
    } catch (e) {
      return handleError(c, e, "Failed to get wallet balance", 500);
    }
  },
  getWalletTransactions: async (c: ContextWithUser) => {
    const { username } = c.get("user");
    try {
      const userWalletTransactions = await walletService.getUserWalletTransactions(username);
      const userWalletTransactionsFormatted = userWalletTransactions
        .map((transaction) => ({
          wallet_tx_id: transaction.wallet_tx_id,
          stock_tx_id: transaction.stock_tx_id,
          is_debit: transaction.is_debit,
          amount: transaction.amount,
          time_stamp: transaction.time_stamp.toISOString(),
        }))
        .sort((t1, t2) => t1.time_stamp.localeCompare(t2.time_stamp));

      return c.json({ success: true, data: userWalletTransactionsFormatted });
    } catch (e) {
      return handleError(c, e, "Failed to get wallet transactions", 500);
    }
  },
  addMoneyToWallet: async (c: ContextWithUser<WrappedInput<AddMoneyToWalletRequest>>) => {
    const { username } = c.get("user");
    const { amount } = c.req.valid("json");

    if (amount < 0) {
      return handleError(
        c,
        new Error("A negative value cannot be added to the wallet"),
        "A negative value cannot be added to the wallet",
        400
      );
    }
    try {
      await walletService.addMoneyToWallet(username, amount);
      return c.json({ success: true, data: null });
    } catch (e) {
      return handleError(c, e, "Failed to add money to wallet", 500);
    }
  },
};

export default walletController;
