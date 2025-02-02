
import { stockSchema } from './redisSchema';
import { RedisInstance } from './RedisInstance';
import {Schema, Repository, EntityId} from 'redis-om';

const main = async () => {

  console.log("Hello from shared-models!");

};

main().catch((error) => console.error('Error in main:', error));
