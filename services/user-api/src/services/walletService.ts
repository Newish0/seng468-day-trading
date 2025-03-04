import { Repository } from "redis-om";
import { RedisInstance } from "shared-models/RedisInstance";
import {
  userSchema,
  walletTransactionSchema,
  type User,
  type WalletTransaction,
} from "shared-models/redisSchema";
import userService from "./userService";

// Creating connection here due to the implementation of RedisInstance.ts
// This is probably NOT good - causes multiple connection creation?
let redisConnection: RedisInstance = new RedisInstance();
try {
  redisConnection.connect();
} catch (error) {
  throw new Error("Error starting database server");
}
const userRepository: Repository<User> = await redisConnection.createRepository(userSchema);
const walletTransactionRepository: Repository<WalletTransaction> =
  await redisConnection.createRepository(walletTransactionSchema);

const walletService = {
  addMoneyToWallet: async (userId: string, amount: number) => {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    try {
      const user = await userService.getUserFromId(userId);
      const currentBalance = user.wallet_balance;
      const newBalance = currentBalance + amount;

      await userRepository!.save({ ...user, wallet_balance: newBalance });
    } catch (e) {
      throw new Error("User not found");
    }
  },
  async getUserWalletTransactions(userId: string) {
    try {
      const userWalletTransactions = await walletTransactionRepository
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
