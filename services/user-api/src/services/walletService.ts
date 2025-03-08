import userService from "./userService";
import { db, connUser } from "shared-models/newDb";
import { userWalletAtomicUpdate } from "shared-models/redisRepositoryHelper";
import { EntityId } from "redis-om";

const walletService = {
  addMoneyToWallet: async (userId: string, amount: number) => {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    const user = await (async () => {
      try {
        return await userService.getUserFromId(userId);
      } catch (e) {
        throw new Error("Failed to get user");
      }
    })();

    if (!user) throw new Error("User not found");

    const success = await userWalletAtomicUpdate(connUser, user[EntityId]!, amount);

    if (!success) {
      throw new Error("Failed to add money to wallet");
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
