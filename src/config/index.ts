import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
    env: string;
  };
  etg: {
    baseUrl: string;
    keyId: string;
    apiKey: string;
    userAgent: string;
    timeout: {
      search: number;
      prebook: number;
      booking: number;
    };
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  cache: {
    ttl: {
      hotelpage: number;
      search: number;
    };
  };
  webhook: {
    secret: string;
    url: string;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  etg: {
    baseUrl: process.env.ETG_BASE_URL || 'https://api.worldota.net',
    keyId: process.env.ETG_KEY_ID || '',
    apiKey: process.env.ETG_API_KEY || '',
    userAgent: process.env.ETG_USER_AGENT || 'ETGApi/1.0.0',
    timeout: {
      search: parseInt(process.env.SEARCH_TIMEOUT || '30', 10) * 1000,
      prebook: parseInt(process.env.PREBOOK_TIMEOUT || '60', 10) * 1000,
      booking: parseInt(process.env.BOOKING_TIMEOUT || '120', 10) * 1000,
    },
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'etgapi',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  cache: {
    ttl: {
      hotelpage: parseInt(process.env.CACHE_TTL_HOTELPAGE || '3600', 10),
      search: parseInt(process.env.CACHE_TTL_SEARCH || '1800', 10),
    },
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET || '',
    url: process.env.WEBHOOK_URL || '',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
