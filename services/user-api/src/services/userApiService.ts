// TODO: STUBS
class RedisInstance {
  connect() {}
  async createRepository(schema: any, name: string) {}
}
type Repository<T> = any;
const userSchema = null;
const stockSchema = null;
// TODO: END STUBS

export let redisConnection: RedisInstance | null = null;
export let userRepository: Repository<any> | null = null; // TODO: remove the any
export let stockRepository: Repository<any> | null = null; // TODO: remove the any
export async function setupRedisConnection() {
  redisConnection = new RedisInstance();
  redisConnection.connect();
  userRepository = await redisConnection.createRepository(
    // TODO: This might need to be fetchRepository
    userSchema,
    "user_repo"
  );
  stockRepository = await redisConnection.createRepository(
    // TODO: This might need to be fetchRepository
    stockSchema,
    "stock_repo"
  );
}
