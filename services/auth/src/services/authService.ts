import { sign } from "hono/jwt";
import bcrypt from "bcrypt";
import { userSchema, type User } from "shared-models/redisSchema";
import { RedisInstance } from "shared-models/RedisInstance";
import { Repository } from "redis-om";

const JWT_SECRET = Bun.env.JWT_SECRET || "secret"; // TODO: Remove 'secret' in prod
const SALT_ROUNDS = 10;

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
  /**
   * Registers a new user in the system.
   * @param username - The desired username.
   * @param password - The user's password.
   * @param name - The user's full name.
   * @throws Error - If user already exists.
   */
  register: async (username: string, password: string, name: string): Promise<void> => {
    let existingUser;
    try {
      existingUser = await userRepository
        .search()
        .where("user_name")
        .equals(username)
        .returnFirst();
    } catch (error) {
      throw new Error("Failed to check if user exists");
    }

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: User = {
      user_name: username,
      password: hashedPassword,
      name,
      wallet_balance: 0,
    };

    try {
      await userRepository.save(newUser);
    } catch (error) {
      throw new Error("Failed to register user");
    }
  },

  /**
   * Logs in a user by verifying credentials and generating a JWT token.
   * @param username - The user's username.
   * @param password - The user's password.
   * @returns The JWT token for the authenticated user.
   * @throws Error - If credentials are invalid or user is not found.
   */
  login: async (username: string, password: string): Promise<{ token: string }> => {
    let user;

    try {
      user = await userRepository.search().where("user_name").equals(username).returnFirst();
    } catch (error) {
      throw new Error("Failed to retrieve user data");
    }

    if (!user) {
      throw new Error("User not found");
    }
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new Error("An error has occured validating passwords");
    }

    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }

    const payload = {
      username: user.user_name,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 300, // 5m expiry
    };

    try {
      const token = await sign(payload, JWT_SECRET);
      return { token };
    } catch (error) {
      throw new Error("Failed to generate token");
    }
  },
};

export default service;
