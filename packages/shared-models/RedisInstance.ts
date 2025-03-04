import type { RedisClientType } from "redis";
import { createClient } from "redis";
import type { Entity } from "redis-om";
import { Repository, Schema } from "redis-om";
import {
  ownedStockSchema,
  stockSchema,
  stockTransactionSchema,
  userSchema,
  walletTransactionSchema,
} from "./redisSchema";

//Instantiation object
class RedisInstance {
  // private instance: RedisInstance; // Not static as we may need omre instanes
  // May need some help with setting redisClient and repositoryDict as static vars, so we can make sure we have proper
  // Synchronization amoung the microservices
  private redisClient: RedisClientType;
  private repositoryDict: Record<string, Repository<Entity>> = {};
  private schemas: Record<string, Schema> = {
    users: userSchema,
    ownedStock: ownedStockSchema,
    stock: stockSchema,
    walletTransaction: walletTransactionSchema,
    stockTransaction: stockTransactionSchema,
  };

  /**
   *
   * @param redisUrl - Optional argument to connect to a differnt Redis server
   */
  constructor(redisUrl: string = process.env.REDIS_URL || "redis://localhost:6379") {
    this.redisClient = createClient({ url: redisUrl });
  }

  /**
   * Connects to the Redis server and initializes the repositorys.
   * @returns {void} - Should return nothing. If a error occurs it should be thrown up
   */
  async connect(): Promise<void> {
    try {
      // Here we perform a check to see if the Redis client is connected
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }

      for (const [repoKey, schema] of Object.entries(this.schemas)) {
        // repository = new Repository<InferSchema<Entity>>(schema, redisInstance.getClient());
        let repository = new Repository<Entity>(schema, this.redisClient);
        repository.createIndex(); // All of our repositorys should expect to be indexed into
        this.repositoryDict[repoKey] = repository;
      }
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  /**
   * This function returns the dictionary of all the repositorys
   * @returns {Promise<Record<string, Repository<Entity>>} - Returns a dictionary of all the repositorys
   */
  async getRepositoryDict(): Promise<Record<string, Repository<Entity>>> {
    return this.repositoryDict;
  }

  /**
   * Returns a specific repository given a name
   * @param name - The name of the repository we want to retrieve
   * @returns {Promise<Repository<Entity>>} - Returns the repository we wanted to retrieve
   */
  async getRepository(name: string): Promise<Repository<Entity>> {
    return this.repositoryDict[name];
  }

  /**
   * Disconnect from Redis
   * @returns {Promise<void>} - Resolves when disconnected successfully
   */
  async disconnect(): Promise<void> {
    try {
      await this.redisClient.quit();
      console.log("Disconnected from Redis.");
    } catch (error) {
      console.error("Error while disconnecting Redis:", error);
      throw error;
    }
  }

  /**
   * Returns the Redis Client
   * @returns RedisClientType
   */
  getClient(): RedisClientType {
    return this.redisClient;
  }

  /**
   * Queries the database, and performs a quick check to see if the schema has already been instantiated within the database.
   * @param name - Name of the repository we want to check for
   * @returns boolean - A boolean value determining if the repository already exists in the database
   */
  async doesRepositoryExist(name: string): Promise<number> {
    // Need to typecast this if it exists, but for now this works
    let key: string = name + ":index:hash"; // The naming convention for the repositories should follow this format.
    return await this.redisClient.exists(key); // Returns true if repository does exist
  }

  /**
   * Creates a repository given a schema and name. It will then add it to the global dictionary
   * @param schema - The type of schema the Repository will be supporting
   * @param name - The name of the repository
   * @returns {Repository<any>} - Returns the repository it instantiated
   */
  async createRepository(schema: Schema): Promise<Repository<any>> {
    // Check if Redis client is connected
    if (!this.redisClient.isOpen) {
      throw new Error("Redis client is not connected to a live instance.");
    }

    // Create repository with the schema
    const repository = new Repository<any>(schema, this.redisClient);

    // All of our repositories should expect to be indexed.
    // NOTE: Was getting problems without try catch.
    try {
      await repository.createIndex();
    } catch (error) {
      console.error("Failed to create index:", error);
    }

    return repository;
  }
}

export { RedisInstance };
