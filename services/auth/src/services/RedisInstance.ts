
import {Schema, Repository, EntityId} from 'redis-om';
import { createClient} from 'redis';
import type { RedisClientType, RedisModules } from 'redis'; 


//Instantiation object
class RedisInstance {
  // private instance: RedisInstance; // Not static as we may need omre instanes
  // May need some help with setting redisClient and repositoryDict as static vars, so we can make sure we have proper
  // Synchronization amoung the microservices
  private redisClient: RedisClientType;
  private repositoryDict: Record<string, Repository<any>> = {}; // A dictionary to store repositories

  /**
   * 
   * @param redisUrl - Optional argument to connect to a differnt Redis server
   */
  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.redisClient = createClient({ url: redisUrl });

    // Proper error handling
    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      throw new Error(`Redis connection error: ${err.message}`);
    });
  }

  /**
   * Connects to the Redis server
   * @returns {void} - Should return nothing. If a error occurs it should be thrown up
   */
  async connect(): Promise<void> {
    try {
      await this.redisClient.connect();
      console.log('Connected to Redis at:', this.redisClient.options?.url);
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   * @returns {Promise<void>} - Resolves when disconnected successfully
   */
    async disconnect(): Promise<void> {
      try {
        await this.redisClient.quit();
        console.log('Disconnected from Redis.');
      } catch (error) {
        console.error('Error while disconnecting Redis:', error);
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
   * Performs a quick check within the dictionary to see if a 
   * @param name - Name of the repository we want to check for
   * @returns boolean - A boolean value determining if the repository already exists in the database
   */
  doesRepositoryExist(name: string): boolean {
    // Need to typecast this if it exists, but for now this works
    return !(!this.repositoryDict[name]); // Returns true if repository does exist
  }

  /**
   * Gets the repository given its name. A check to see if the repository exists should be performed first
   * @param name - The name of the repository we want to check for
   * @returns {Repository<any>} - The repository that is stored in the dictionary 
   */
  getRepository(name: string): Repository<any> {
    return this.repositoryDict[name];
  }

  /**
   * Creates a repository given a schema and name. It will then add it to the global dictionary 
   * @param schema - The type of schema the Repository will be supporting 
   * @param name - The name of the repository 
   * @returns {Repository<any>} - Returns the repository it instantiated
   */
  async createRepository(schema: Schema, name: string): Promise<Repository<any>> {
    // Check if Redis client is connected
    if (!this.redisClient.isOpen) {
      throw new Error('Redis client is not connected to a live instance.');
    }

    // Check if a repository with the same name already exists
    if (this.doesRepositoryExist(name)) {
      throw new Error(`Repository with name '${name}' already exists.`);
    }

    // Create repository with the schema
    const repository = new Repository(schema, this.redisClient);
    await repository.createIndex();
    // Add the repository to the dictionary
    this.repositoryDict[name] = repository;

    return repository;
  }

  /**
   * Takes the given repository, and adds the data into it. The Repository and data passed to it need to have a matching schema in order to work
   * there is no error handling in the case where we pass into the repository a differnt schema from what its configured to.
   * @param repository - The repository we want to insert data into
   * @param data - The data we want to insert into the repository
   * @returns {Promise<string>} - Returns the key in which we inserted our data into.
   */
  async addIntoRepository(repository: Repository<any>, data: any): Promise<string> {
    // Saving the data to the repository
    const record : any = await repository.save(data);

    // Returning the EntityId
    return record[EntityId]; // or record.entityId if EntityId is not used directly as a key
  }

  /**
   * Takes the given repository, and retrieves the data stored at the given key.
   * @param repository - The repository we want to insert data into
   * @param key - The key for the data we want to retrieve from the repository
   * @returns {Promise<any>} - Returns the data stored at that key.
   */
  async getFromRepository(repository: Repository<any>, key: string): Promise<any> {
    let data : any = await repository.fetch(key);
    return data;
  }

  /**
   * Takes the given repository, and retrieves the data stored at the given key.
   * @param repository - The repository we want to insert data into
   * @param key - The key for the data we want to retrieve from the repository
   * @returns {Promise<void>} - Returns nothing.
   */
  async removeFromRepository(repository: Repository<any>, key: string): Promise<void> {
    await repository.remove(key);
  }

  /**
   * Takes the given repository, and updates the data based on the given key. Redis doesn't seem to have a intuitive way of updating information it seems.
   * So currently, all this function does is take the same object and overwrite it.
   * @param repository - The repository we want to insert data into
   * @param key - The key for the data we want to update from the repository
   * @param replacement - The data we want to insert into the repository
   * @returns {Promise<string>} - Returns the key in which we updated our data into.
   */
  async updateFromRepository(repository: Repository<any>, key: string, replacement: any): Promise<void> {
    //  // Saving the data to the repository
    //  const record : any = await repository.save(key, replacement);

    //  // Returning the EntityId
    //  return record[EntityId]; // or record.entityId if EntityId is not used directly as a key
    console.log("I don't work yet");
  }

}

export {RedisInstance};