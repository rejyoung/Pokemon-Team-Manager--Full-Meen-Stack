require("dotenv").config();
const { createClient } = require("redis");
const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
});

async function initializeRedis() {
    try {
        await redisClient.connect();
        console.log("Redis is connected and key is set");
    } catch (err) {
        console.error("Failed to initialize Redis:", err);
    }
}

initializeRedis();

module.exports = redisClient;
