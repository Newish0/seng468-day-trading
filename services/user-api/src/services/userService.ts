import { redisConnection, setupRedisConnection, userRepository } from "./userApiService";

const service = {
  getUserFromId: async (userId: string) => {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    try {
      const user = await userRepository!.search().where("user_name").equals(userId).returnFirst();
      if (!user) {
        throw new Error();
      }
      return user;
    } catch (e) {
      throw new Error("User not found");
    }
  },
};

export default service;
