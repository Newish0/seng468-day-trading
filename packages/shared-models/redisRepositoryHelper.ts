import {Schema, Repository, EntityId} from 'redis-om';
import { createClient } from 'redis';
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
 * Takes the given repository, and retrieves the data stored at the given key.
 * @param repository - The repository we want to insert data into
 * @param key - The key for the data we want to retrieve from the repository
 * @returns {Promise<void>} - Returns nothing.
 */
export async function removeFromRepository(repository: Repository<Entity>, key: string): Promise<void> {
await repository.remove(key);
}

/**
 * Gets the key from the entity. This is a helper function to get the key from the entity
 * @param entity - The entity we want to get the key from
 * @returns 
 */
export async function getKeyFromEntity(entity: Entity): Promise<string> {
    return entity[EntityId] as string;
}

/**
 * 
 * @param redisInstance - The redis client instance
 * @param stockOwnedKey - The key of the stock owned object we want to update
 * @param amountToChange - The amount we want to change the current_quantity by
 * @returns {Promise<boolean>} - Returns true if the stock was successfully updated, false if the stock would be decremented below 0 or had a error
 */
export async function ownedStockAtomicUpdate(redisInstance: RedisClientType, stockOwnedKey: string, amountToChange: number): Promise<boolean> {
    // If a true is returned its actually a 1, if false its null 
    const luaScript = `
    local data = redis.call('JSON.GET', KEYS[1])
    local jsonData = cjson.decode(data)
    local amountToChange = tonumber(ARGV[1])

    if (jsonData.current_quantity + amountToChange) < 0 then
        return false
    else
        jsonData.current_quantity = jsonData.current_quantity + amountToChange
        redis.call('JSON.SET', KEYS[1], '.', cjson.encode(jsonData))
        return true    
    end
    `; 

    try {
        //Not sure if I can remove any, also gotta add users: because redis-om adds it
        // This is a finnecky thing, but it works and does it atomically
        const result = await redisInstance.eval(luaScript, { keys: ["owned_stocks:" + stockOwnedKey], arguments: [amountToChange.toString()] } as any); // Args need to be passed as strings
        // console.log(result);
        return result !== null;
    } catch (error) {
        console.error("Error executing Lua script:", error);
        return false;
    }
}

export async function userWalletAtomicUpdate(redisInstance: RedisClientType, userKey: string, amountToChange: number): Promise<boolean> {
    // If a true is returned its actually a 1, if false its null 
    const luaScript = `
    local data = redis.call('JSON.GET', KEYS[1])
    local jsonData = cjson.decode(data)
    local amountToChange = tonumber(ARGV[1])

    if (jsonData.is_locked) and (amountToChange < 0) then
        return false
    else
        jsonData.wallet_balance = jsonData.wallet_balance + amountToChange
        redis.call('JSON.SET', KEYS[1], '.', cjson.encode(jsonData))
        return true    
    end
    `; 

    try {
        //Not sure if I can remove any, also gotta add users: because redis-om adds it
        // This is a finnecky thing, but it works and does it atomically
        const result = await redisInstance.eval(luaScript, { keys: ["users:" + userKey], arguments: [amountToChange.toString()] } as any); // Args need to be passed as strings
        // console.log(result);
        return result !== null;
    } catch (error) {
        console.error("Error executing Lua script:", error);
        return false;
    }
}

/**
 * This function locks a user's wallet, letting a user know no operations should be performed on it.
 * This is done by setting the is_locked field to true in the user object.
 * @param redisInstance - The redis client instance
 * @param user_key - The key of the user we want to lock
 * @returns {Promise<boolean>} - Returns true if the user was successfully locked, false if the user was already locked or had a error
 */
export async function lockUserWallet(redisInstance: RedisClientType, user_key: string): Promise<boolean> {
    // If a true is returned its actually a 1, if false its null 
    const luaScript = `
    local data = redis.call('JSON.GET', KEYS[1])
    local jsonData = cjson.decode(data)

    if jsonData.is_locked then
        return false
    else
        jsonData.is_locked = true
        redis.call('JSON.SET', KEYS[1], '.', cjson.encode(jsonData))
        return true    
    end
    `; 

    try {
        // Not sure if I can remove any, also gotta add users: because redis-om adds it
        // This is a finnecky thing, but it works and does it atomically
        const result = await redisInstance.eval(luaScript, { keys: ["users:" + user_key], arguments: [] } as any); 
        // console.log(result);
        return result !== null;
    } catch (error) {
        console.error("Error executing Lua script:", error);
        return false;
    }
}

/**
 * This function unlocks a user's wallet, letting a user know operations can be performed on it.
 * This is done by setting the is_locked field to false in the user object.
 * @param repository - The repository we want to update the users wallet in
 * @param key - The key of the user we want to unlock
 */
export async function unlockUserWallet(repository: Repository<Entity>, key: string): Promise<void> {
    let user = await repository.fetch(key);
    user.is_locked = false;
    repository.save(user);
}

