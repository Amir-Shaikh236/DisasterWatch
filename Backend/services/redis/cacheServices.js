import redisClient from "../../config/redis.js";

const DEFAULT_TTL_SECS = 60 * 60 * 48

export const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        if (!data) return null;

        return JSON.parse(data);

    } catch (error) {
        console.log(`Redis GET failed: [${key}] `, error);
        return null;

    }
}

export const setCache = async (key, data, ttl = 300) => {
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
        return true;

    } catch (error) {
        console.error(`Redis SET failed: [${key}]:`, error)
        return false

    }
}

export const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
        return true;

    } catch (error) {
        console.error(`Redis DELETE failed: [${key}]: `, error);
        return false;

    }
}

export const isNewAlert = async (alertIdentifier, ttl = DEFAULT_TTL_SECS) => {
    if (!alertIdentifier) return true;

    const key = `alert:${alertIdentifier}`

    try {
        const result = await redisClient.set(key, '1', {
            NX: true,
            EX: ttl
        });

        return result === 'OK'

    } catch (error) {
        console.error(`Redis Duplication Check Failed [${key}]: `, error)

        //allow processing to continue even if Redis goes down
        return true;

    }
}