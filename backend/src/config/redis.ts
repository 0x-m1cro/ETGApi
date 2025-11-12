import Redis from 'ioredis';
import config from './index';
import logger from './logger';

// Check if running on Vercel with KV_REST_API_URL (Upstash Redis)
const isVercelKV = process.env.KV_REST_API_URL !== undefined;

let redis: Redis;

if (isVercelKV) {
  // Use Upstash Redis (Vercel KV) connection string
  // Format: redis://default:password@host:port
  const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
  if (redisUrl) {
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    logger.info('Using Vercel KV (Upstash Redis) connection');
  } else {
    throw new Error('KV_URL or REDIS_URL not set for Vercel KV');
  }
} else {
  // Use traditional Redis configuration
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
  logger.info('Using traditional Redis connection');
}

redis.on('error', (err) => {
  logger.error('Redis connection error', err);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

export default redis;
