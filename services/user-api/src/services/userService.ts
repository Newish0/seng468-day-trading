// TODO: Everything in this block is stubbed out. This should all come from other modules
type OwnedStock = {
  id: string;
  name: string;
  quantity: number;
};
type User = {
  id: string;
  name: string;
  email: string;
  portfolio: OwnedStock[];
};
class RedisInstance {
  connect() {}
  async createRepository(schema: any, name: string) {}
}
type Repository<T> = any;
const userSchema = null;
// TODO: End stub block

let redisConnection: RedisInstance | null = null;
let userRepository: Repository<any> | null = null;
async function setupRedisConnection() {
  redisConnection = new RedisInstance();
  redisConnection.connect();
  userRepository = await redisConnection.createRepository(
    userSchema,
    "user_repo"
  );
}

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
