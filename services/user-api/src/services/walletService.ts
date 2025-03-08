import userService from "./userService";
import { db } from "shared-models/newDb";

const walletService = {
  addMoneyToWallet: async (userId: string, amount: number) => {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    try {
      const user = await userService.getUserFromId(userId);
      const currentBalance = user.wallet_balance;
      const newBalance = currentBalance + amount;

      await db.userRepo!.save({ ...user, wallet_balance: newBalance });
    } catch (e) {
      throw new Error("User not found");
    }
  },
  async getUserWalletTransactions(userId: string) {
    try {
      const userWalletTransactions = await db.walletTxRepo
        .search()
        .where("user_name")
        .equals(userId)
        .returnAll();
      return userWalletTransactions;
    } catch (e) {
      throw new Error("Failed to get user wallet transactions");
    }
  },
};

export default walletService;
