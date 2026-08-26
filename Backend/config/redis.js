import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

redisClient.on("error", (error) => {
    console.error("Redis Client Error: ", error);
});

redisClient.on("connect", () => {
    console.log("Redis Connecting..");
});

redisClient.on("ready", () => {
    console.log('Redis Connected and ready');
});

redisClient.on("reconnecting", () => {
    console.log("Redis Re-Connecting...")
});

redisClient.on("end", () => {
    console.log('Redis Connection Closed');
});

export const connectRedis = async () => {
    if (redisClient.isOpen) return;
    await redisClient.connect();
}

export const getRedisClient = () => {
    return redisClient;
}

export default redisClient;