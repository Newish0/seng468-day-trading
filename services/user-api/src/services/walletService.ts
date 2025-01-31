import { redisConnection, setupRedisConnection } from "./userApiService";
import userService from "./userService";

const walletService = {
  addMoneyToWallet: async (userId: string, amount: number) => {
    if (!redisConnection) {
      setupRedisConnection();
    }
    const user = await userService.getUserFromId(userId);
    const currentBalance = user.walletBalance;
    const newBalance = currentBalance + amount;
    if (newBalance < 0) {
      throw new Error("User will be left with negative balance");
    }
    // await userRepository.update(user.id, { walletBalance: newBalance });
  },
};

export default walletService;
