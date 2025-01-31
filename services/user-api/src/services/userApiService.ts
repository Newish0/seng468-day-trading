// TODO: STUBS
class RedisInstance {
  connect() {}
  async createRepository(schema: any, name: string) {}
}
type Repository<T> = any;
const userSchema = null;
// TODO: END STUBS

export let redisConnection: RedisInstance | null = null;
export let userRepository: Repository<any> | null = null;
export async function setupRedisConnection() {
  redisConnection = new RedisInstance();
  redisConnection.connect();
  userRepository = await redisConnection.createRepository(
    userSchema,
    "user_repo"
  );
}
