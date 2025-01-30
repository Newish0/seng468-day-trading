
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

  let repository_name = "stock_repo";

  let stock_repository: Repository<any> = await redisConnection.createRepository(stockSchema, repository_name);

  let stock_key = await redisConnection.addIntoRepository(stock_repository, stock);
  // Set a key-value pair

  let data = await redisConnection.getFromRepository(stock_repository, stock_key);

  console.log("This should log out our data");
  console.log(data);

  stock = {
    stock_id: "2",
    stock_name: "Minecraft",
  }

  let stock_key_two = await redisConnection.addIntoRepository(stock_repository, stock);

  data = await redisConnection.getFromRepository(stock_repository, stock_key_two);

  console.log("This should contain our new data");
  console.log(data);

  // Not sure how to update just yet, I can update specific features but I am having trouble creating a intuitive function for it.
  // stock = {
  //   stock_id: "1",
  //   stock_name: "PUBG",
  // }

  // await redisConnection.updateFromRepository(stock_repository, stock_key, stock);

  // console.log("This should contain our updated data, as well as the previously inserted data");
  // console.log( await redisConnection.getFromRepository(stock_key));
  // console.log(await redisConnection.getFromRepository(stock_key_two));

  redisConnection.disconnect();
  
};

main().catch((error) => console.error('Error in main:', error));
