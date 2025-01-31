import { redisConnection, setupRedisConnection } from "./userApiService";

const service = {
  getUserFromId: async (userId: string) => {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    /*
    let user: User;
    try {
      user = await userRepository
        .search()
        .where("id")
        .equals(userId)
        .returnFirstOrThrow(); // Is this a function?
    } catch (e) {
      throw new Error("User not found");
    }
    */
    const user = {
      id: userId,
      name: "John Doe",
      email: "something@email.com",
      portfolio: [
        {
          id: "1",
          name: "AAPL",
          quantity: 10,
        },
        {
          id: "2",
          name: "GOOGL",
          quantity: 5,
        },
      ],
    };
    return user;
  },
};

export default service;
