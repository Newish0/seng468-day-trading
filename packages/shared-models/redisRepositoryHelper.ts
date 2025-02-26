import {Schema, Repository, EntityId} from 'redis-om';
import { createClient} from 'redis';
import type { RedisClientType, RedisModules } from 'redis'; 
import type { Entity } from 'redis-om';


/**
 * Takes the given repository, and adds the data into it. The Repository and data passed to it need to have a matching schema in order to work
 * there is no error handling in the case where we pass into the repository a differnt schema from what its configured to.
 * @param repository - The repository we want to insert data into
 * @param data - The data we want to insert into the repository
 * @returns {Promise<string>} - Returns the key in which we inserted our data into.
 */
export async function addIntoRepository(repository: Repository<Entity>, data: Entity): Promise<string> {
// Saving the data to the repository
const record : Entity = await repository.save(data);

// Returning the EntityId
return record[EntityId] as string; // or record.entityId if EntityId is not used directly as a key
}

/**
 * Takes the given repository, and retrieves the data stored at the given key.
 * @param repository - The repository we want to insert data into
 * @param key - The key for the data we want to retrieve from the repository
 * @returns {Promise<Entity>} - Returns the data stored at that key.
 */
export async function getFromRepository(repository: Repository<Entity>, key: string): Promise<Entity> {
let data : Entity | Entity[] = await repository.fetch(key);
return data;
}

/**
 * Takes the given repositories (should be user and stockOwned), and retrieves the data stored under portfolio from the given user key.
 * @param userRepository - The user repository we want to retrieve our user from
 * @param stockOwnedRepository - The stock owned repository, contain our owned stock data
 * @param userKey - The key of the user whos portfolio we want to retrieve
 * @returns {Promise<Entity>} - Returns the data stored at that key.
 */
export async function getOwnedStock(userRepository: Repository<Entity>, stockOwnedRepository: Repository<Entity>, userKey: string): Promise<Entity> {
    let user : any = await userRepository.fetch(userKey); 
    let data : Entity =  await stockOwnedRepository.fetch(user.portfolio);
    return data;
    }

/**
 * Takes the given repository, and retrieves the data stored at the given key.
 * @param repository - The repository we want to insert data into
 * @param key - The key for the data we want to retrieve from the repository
 * @returns {Promise<void>} - Returns nothing.
 */
export async function removeFromRepository(repository: Repository<Entity>, key: string): Promise<void> {
await repository.remove(key);
}

export async function getKeyFromEntity(entity: Entity): Promise<string> {
    return entity[EntityId] as string;
}

export async function updateReservedFundIfSufficient(
    redisInstance: RedisClientType, 
    userRepository: Repository<Entity>, 
    userName: string, 
    amountToDeduct: number
): Promise<boolean> {
    let user: Entity = await userRepository.fetch(userName);

    if (user.wallet_balence == null) {
        user.wallet_balence = 0;
        throw new Error("User wallet_balance is null");
    }

    if (typeof user.reserved_funds === "number" && user.reserved_funds >= amountToDeduct) {
        const key = user[EntityId]; // JSON string key

        // Fetch current JSON, modify it, and update atomically
        if (!key) {
            throw new Error("Entity key is undefined");
        }
        const data = await redisInstance.get(key);
        let userData = data ? JSON.parse(data) : {};

        userData.reserved_funds = 10;

        // Perform atomic update in Redis
        const multi = redisInstance.multi();
        multi.set(key, JSON.stringify(userData));
        await multi.exec(); // Ensure the transaction executes properly

        return true;
    }

    return false;
}

