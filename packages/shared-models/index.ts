console.log("Hello via Redis!");

import { redisClient, connectRedis } from './redisSchema';

const main = async () => {
  await connectRedis();

  // Set a key-value pair
  await redisClient.set('exampleKey', 'exampleValue');

  // Get the value of the key
  const value = await redisClient.get('exampleKey');
  console.log('Value from Redis:', value);

  // Close the connection when done
  await redisClient.quit();
};

main().catch((error) => console.error('Error in main:', error));
