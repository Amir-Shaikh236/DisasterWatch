import redisClient from "../../config/redis.js";

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