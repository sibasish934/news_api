import { Queue } from "bullmq";

export const redisConnection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

export const bullConfig = {
  delay: 5000,
  removeOnComplete: {
    count: 100,
    age: 60 * 60 * 24,
  },
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
};
