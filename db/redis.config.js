import redis from "express-redis-cache";

const redisCache = redis({
    port: 6379,
    host: "192.168.16.210",
    prefix: "news_api_backend",
    expire: 60 * 60
})

export default redisCache;