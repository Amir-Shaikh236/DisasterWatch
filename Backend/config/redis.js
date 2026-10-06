import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

redisClient.on("error", (error) => {
    console.error("Redis Client Error: ", error);
});

redisClient.on("ready", () => {
    console.log('Redis Connected and ready');
});

export const connectRedis = async () => {
    if (redisClient.isOpen) return;
    await redisClient.connect();
}

export const getRedisClient = () => {
    return redisClient;
}

export default redisClient;