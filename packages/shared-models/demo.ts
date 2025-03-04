
import type { Entity } from 'redis-om';
import { EntityId, Repository } from 'redis-om';
import { RedisInstance } from './RedisInstance';
import { addIntoRepository, getFromRepository, lockUserWallet, ownedStockAtomicUpdate, userWalletAtomicUpdate } from "./redisRepositoryHelper";
import { ownedStockSchema, stockSchema, userSchema } from './redisSchema';

/**
 * Here is a quick demo of the created object. Should contain all CRUD operations required for a basic database except for update (trying to figure that one out).
 * Searching and other features specific to Redis-Om have not been created yet, but will be after additional features get requested.
 */
const main = async () => {
  let redisConnection : any = new RedisInstance();

  await redisConnection.connect();

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
  let stock_key = await addIntoRepository(stock_repository, stock);
  
  let data : any = await getFromRepository(stock_repository_two, stock_key);

  // console.log("This should log out our data");
  // console.log(data);

  /**
   * Now lets use the search function. We can search for data even without its Keys if they are stored in repositories
   */

  /* Commented out right now for testing purposes
  // Quick loop to just insert some data
  for (let i = 2; i < 10; i += 1) {
    stock = {
      stock_id: i,
      stock_name: "Minecraft_" + i,
    }

    await addIntoRepository(stock_repository, stock);
  }

  data = await stock_repository_two.search().return.all();
  console.log("Here is all the data in our repository");
  console.log(data);
  */

  /**
   * Here we can check if a repository exists before we want to query data from it. All repository names are defined
   * in the schema. This file should be called redisSchema.ts. The values returned should also be numbers.
   */
  console.log("Dose repository stocks exist?")
  console.log(await redisConnection.doesRepositoryExist("stocks"));

  console.log("Dose repository user exist?")
  console.log(await redisConnection.doesRepositoryExist("user"));

  /**
   * Here should be some example code showing how we can retrieve the stocks a user schema/profile owns. Also a function has now been
   * created for that express purpose.
   */

  let owned_stock_one : Entity = {
    stock_id: "1",
    stock_name: "Fortnite",
    current_quantity: 123,
  }

  let owned_stock_two : Entity = {
    stock_id: "2",
    stock_name: "Minecraft",
    current_quantity: 2,
  }

  let owned_stock_repository: Repository<Entity> = await redisConnection.createRepository(ownedStockSchema);

  let owned_stock_key_one = await addIntoRepository(owned_stock_repository, owned_stock_one);
  let owned_stock_key_two = await addIntoRepository(owned_stock_repository, owned_stock_two);

  let user_data : Entity = {
    user_name: "Jim", // Could also just be the user id/token
    password: "Jimp",
    name: "Jimbo",
    wallet_balance: 3.5,
    is_locked: false, // Please when creating a schema, set this to false by default. In redis OM there is no way to set a default value
  } 

  user_data.wallet_balance = 10000;

  let user_repository: Repository<any> = await redisConnection.createRepository(userSchema);
  let user_key : string = await addIntoRepository(user_repository, user_data);
  let user_object : any = await (getFromRepository(user_repository, user_key));

  console.log("Here is the user object returned")
  console.log(user_object);
  console.log("Here is the user object's key")
  console.log(user_key);
  console.log("Here is the user object's key again, but this time we are calling it from the object")
  console.log(user_object[EntityId]);

  let lock_result : boolean = await lockUserWallet(redisConnection.getClient(), user_key);

  console.log("Here is the result of the lock function");
  console.log(lock_result);

  lock_result = await lockUserWallet(redisConnection.getClient(), user_key);

  /**
   * To reopen the lock, you can just perform a update on it how you normally would
   */ 
  console.log("Here is the result of the lock function again");
  console.log(lock_result);

  console.log("Here is the result of the lock function after we unlock it");
  user_data = await getFromRepository(user_repository, user_key);
  user_data.is_locked = false;
  await addIntoRepository(user_repository, user_data); // Add the updated user object back into the repository
  lock_result = await lockUserWallet(redisConnection.getClient(), user_key);
  console.log(lock_result);
  console.log(await getFromRepository(user_repository, user_key));

  console.log("Now we are going to be updating the wallet balance of the user atomically");
  let wallet_atomic : boolean = await userWalletAtomicUpdate(redisConnection.getClient(), user_key, 100);

  console.log("Now we are going to be printing out user data after the atomic update");
  console.log(await getFromRepository(user_repository, user_key));


  let owned_stock_atomic : boolean = await ownedStockAtomicUpdate(redisConnection.getClient(), owned_stock_key_one, -100);

  console.log("Here is the result of the atomicOwnedStock function");
  console.log(owned_stock_atomic);

  /**
   * This code will most likely need more regirous testing, but it should work as intended.
   */
  console.log("Here we are calling our ownedStockAtomicUpdate function rapidly 3 times");
  ownedStockAtomicUpdate(redisConnection.getClient(), owned_stock_key_one, -1);
  ownedStockAtomicUpdate(redisConnection.getClient(), owned_stock_key_one, -1);
  ownedStockAtomicUpdate(redisConnection.getClient(), owned_stock_key_one, -1);

  console.log(await getFromRepository(owned_stock_repository, owned_stock_key_one));



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
