import {
  redisConnection,
  setupRedisConnection,
  userRepository,
  walletTransactionRepository,
} from "./userApiService";
import userService from "./userService";

const walletService = {
  addMoneyToWallet: async (userId: string, amount: number) => {
    if (!redisConnection) {
      setupRedisConnection();
    }
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    try {
      const user = await userService.getUserFromId(userId);
      const currentBalance = user.wallet_balance;
      const newBalance = currentBalance + amount;
      if (newBalance < 0) {
        throw new Error("User will be left with negative balance");
      }
      await userRepository!.save({ ...user, wallet_balance: newBalance });
    } catch (e) {
      throw new Error("User not found");
    }
  },
  async getUserWalletTransactions(userId: string) {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    try {
      const userWalletTransactions = await walletTransactionRepository!
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
