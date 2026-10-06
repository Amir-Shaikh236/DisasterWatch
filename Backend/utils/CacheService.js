import { LRUCache } from 'lru-cache'
import { getCache, setCache } from '../services/redis/cacheServices.js';

const l1Cache = new LRUCache({
    max: 500,
    ttl: 1000 * 60
});

const PendingRequests = new Map();

export async function getWithTwoTierCache(key, dbFallbackFn, redisClient) {
    const l1Data = l1Cache.get(key);
    if (l1Data !== undefined) return { data: l1Data, source: 'L1-Memory' };

    if (redisClient && redisClient.isOpen) {
        try {
            const l2Data = await getCache(key);
            if (l2Data) {
                const parsed = typeof l2Data === 'string' ? JSON.parse(l2Data) : l2Data;
                l1Cache.set(key, parsed);
                return { data: parsed, source: 'L2-Redis' }
            }

        } catch (err) {
            console.warn(`L2 Redis Read Failed Error: ${err.message}. Falling Back Safely`);

        }
    }

    if (PendingRequests.has(key)) {
        const sharedData = await PendingRequests.get(key);
        return { data: sharedData, source: 'DB-SingleFlight' };
    }

    const fetchPromise = (async () => {
        try {
            const dbData = await dbFallbackFn();
            const isValidate = dbData !== null && dbData !== undefined;

            if (isValidate) l1Cache.set(key, dbData);

            if (redisClient && redisClient.isOpen && isValidate) {
                await setCache(key, dbData);
            }

            return dbData;

        } finally {
            PendingRequests.delete(key);

        }

    })();

    PendingRequests.set(key, fetchPromise);

    const dbData = await fetchPromise;
    return { data: dbData, source: 'Database' }
}

export function invalidateKey(key) {
    l1Cache.delete(key)
}