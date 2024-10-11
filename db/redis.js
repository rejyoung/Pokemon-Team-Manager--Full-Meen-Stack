require("dotenv").config();
const { createClient } = require("redis");
const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
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
