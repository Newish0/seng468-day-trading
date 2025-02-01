
import { stockSchema } from './redisSchema';
import { RedisInstance } from './RedisInstance';
import {Schema, Repository, EntityId} from 'redis-om';

/**
 * Here is a quick demo of the created object. Should contain all CRUD operations required for a basic database except for update (trying to figure that one out).
 * Searching and other features specific to Redis-Om have not been created yet, but will be after additional features get requested.
 */
const main = async () => {
  let redisConnection : any = new RedisInstance();

  redisConnection.connect();

  let stock : any = {
  stock_id: "1",
  stock_name: "Fortnite",
  }

  /**
   * Here is a example of declaring a repository, these are useful to perform search functions on the database.
   * Each repository acts like a table within a database, and you should be able to query for the same data across
   * multiple repositories.
   */
  let stock_repository: Repository<any> = await redisConnection.createRepository(stockSchema);
  let stock_repository_two: Repository<any> = await redisConnection.createRepository(stockSchema);

  // Here a key should be returned for us to query with
  let stock_key = await redisConnection.addIntoRepository(stock_repository, stock);
  
  let data = await redisConnection.getFromRepository(stock_repository_two, stock_key);

  console.log("This should log out our data");
  console.log(data);

  /**
   * Now lets use the search function. We can search for data even without its Keys if they are stored in repositories
   */

  // Quick loop to just insert some data
  for (let i = 2; i < 10; i += 1) {
    stock = {
      stock_id: i,
      stock_name: "Minecraft_" + i,
    }

    await redisConnection.addIntoRepository(stock_repository, stock);
  }

  data = await stock_repository_two.search().return.all();
  console.log("Here is all the data in our repository");
  console.log(data);

  /**
   * Here we can check if a repository exists before we want to query data from it. All repository names are defined
   * in the schema. This file should be called redisSchema.ts. The values returned should also be numbers.
   */
  console.log("Dose repository stocks exist?")
  console.log(await redisConnection.doesRepositoryExist("stocks"));

  console.log("Dose repository user exist?")
  console.log(await redisConnection.doesRepositoryExist("user"));

  redisConnection.disconnect();
  // while (true) {
  //   // Wait for 5 seconds before printing again
  //   const startTime = Date.now();
  //   while (Date.now() - startTime < 50000) {
  //     // Busy-wait loop to simulate delay (blocks thread, not recommended for UI)
  //     // console.log("we running still");
  //   }
  // }
  
};

main().catch((error) => console.error('Error in main:', error));
