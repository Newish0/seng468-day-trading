import { Repository } from "redis-om";
import { RedisInstance } from "shared-models/RedisInstance";
import { userSchema, type User } from "shared-models/redisSchema";

// Creating connection here due to the implementation of RedisInstance.ts
// This is probably NOT good - causes multiple connection creation?
let redisConnection: RedisInstance = new RedisInstance();
try {
  redisConnection.connect();
} catch (error) {
  throw new Error("Error starting database server");
}
const userRepository: Repository<User> = await redisConnection.createRepository(userSchema);

const service = {
  getUserFromId: async (userId: string) => {
    try {
      const user = await userRepository.search().where("user_name").equals(userId).returnFirst();
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
