require("dotenv").config();
const { createClient } = require("redis");
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
