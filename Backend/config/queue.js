import { Queue } from 'bullmq'

function parseRedisUrl(url) {
    const Redis_url = new URL(url || 'redis://127.0.0.1:6379');

    return {
        host: Redis_url.hostname,
        port: parseInt(Redis_url.port, 10) || 6379,
        username: Redis_url.username || undefined,
        password: Redis_url.password || undefined,
        tls: Redis_url.protocol === "rediss:" ? {} : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    }
}

export const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 1000
    },

    removeOnComplete: true
};

export const redisQueueConnection = parseRedisUrl(process.env.REDIS_URL)

export const disasterAlertQueue = new Queue('disaster-alerts', {
    connection: redisQueueConnection,
    defaultJobOptions
});


