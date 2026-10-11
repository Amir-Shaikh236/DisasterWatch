import redisClient from "../config/redis.js"

const LIMITS = {
    image: { userMin: 2, userDay: 5 },
    report: { userMin: 2, userDay: 5 }
}

const GLOBAL = { min: 8, day: 350 };
const ADMIN_MULTIPLIER = 3;

const LUA = `
local limits = {tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3]), tonumber(ARGV[4])}
local ttls = {tonumber(ARGV[5]), tonumber(ARGV[6]), tonumber(ARGV[5]), tonumber(ARGV[6])}
for i = 1, 4 do
    local current = tonumber(redis.call('GET', KEYS[i]) or '0')
    if current >= limits[i] then
        return {0, i, redis.call('TTL', KEYS[i]), 0, 0, 0, 0}
    end
end
local counts = {}
for i = 1, 4 do
    local v = redis.call('INCR', KEYS[i])
    if  v == 1 then
        redis.call('EXPIRE', KEYS[i], ttls[i])
    end
    counts[i] = v
end
return {1, 0, 0, counts[1], counts[2], counts[3], counts[4]}
`;

const REFUND_LUA = `
for i = 1, #KEYS do
  local v = tonumber(redis.call('GET', KEYS[i]) or '0')
  if v > 0 then redis.call('DECR', KEYS[i]) end
end
return 1
`;

function resetDayInfo() {
    const now = new Date();
    const la = new Date(now.toLocaleString("en-US", { timeZone: 'America/Los_Angeles' }));
    const next = new Date(la);
    next.setHours(24, 0, 0, 0)

    const ttl = Math.max(1, Math.ceil((next - la) / 1000));
    const data = la.toISOString().slice(0, 10)

    return { ttl, data }
}

const MESSAGES = {
    1: "You're sending requests too quickly. Please wait a minute.",
    2: "You've reached your daily limit for this feature. Try again tomorrow.",
    3: "The AI service is busy right now. Please try again in a minute.",
    4: "The AI service has reached its daily capacity. Please try again later.",
}

export const geminiRateLimit = (feature) => async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const isAdmin = req.user?.role === "admin";
        const mult = isAdmin ? ADMIN_MULTIPLIER : 1;
        const { userMin, userDay } = LIMITS[feature];
        const { ttl: dayTTL, date } = resetDayInfo();

        const keys = [
            `rl:gemini:${feature}:user:${userId}:min`,
            `rl:gemini:${feature}:user:${userId}:day:${date}`,
            `rl:gemini:global:min`,
            `rl:gemini:global:day:${date}`,
        ];

        const [allowed, failedIndex, retryAfter, uMin, uDay, gMin, gDay] = (
            await redisClient.eval(LUA, {
                keys,
                arguments: [
                    String(userMin * mult), String(userDay * mult),
                    String(GLOBAL.min), String(GLOBAL.day),
                    "60", String(dayTTL),
                ],
            })
        ).map(Number);

        const debug = process.env.GEMINI_RL_DEBUG === "true";

        if (allowed === 1) {
            if (debug) {
                console.log(
                    `[Gemini RL] ${feature} | user ${userId} | ` +
                    `${uMin}/${userMin * mult} this minute, ${uDay}/${userDay * mult} today | ` +
                    `global ${gMin}/${GLOBAL.min} this minute, ${gDay}/${GLOBAL.day} today`
                );
            }

            let refunded = false;
            req.refundGeminiQuota = async () => {
                if (refunded) return;
                refunded = true
                try {
                    await redisClient.eval(REFUND_LUA, { keys, arguments: [] });
                    if (debug) console.log(`REFUNDED ${feature} | User: ${userId}`);

                } catch (err) {
                    next(err);

                }
            }

            return next();
        }

        if (debug) {
            console.log(`[Gemini RL] BLOCKED ${feature} | user ${userId} | ${MESSAGES[failedIndex]}`);
        }

        res.set("Retry-After", String(Math.max(retryAfter, 1)));

        return res.status(429).json({
            success: false,
            message: MESSAGES[failedIndex],
            retryAfter: Math.max(retryAfter, 1),
        });

    } catch (err) {
        console.error("Gemini rate limiter failed, allowing request:", err.message);
        return next();

    }
};
