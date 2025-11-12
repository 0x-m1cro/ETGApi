import { Pool } from 'pg';
import config from './index';
import logger from './logger';

// Check if running on Vercel (POSTGRES_URL environment variable is set by Vercel Postgres)
const isVercel = process.env.POSTGRES_URL !== undefined;

let pool: Pool;

if (isVercel) {
  // Use Vercel Postgres connection string
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Vercel Postgres
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  logger.info('Using Vercel Postgres connection');
} else {
  // Use traditional PostgreSQL configuration
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  logger.info('Using traditional PostgreSQL connection');
}

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
  // Don't exit in serverless environments
  if (!isVercel) {
    process.exit(-1);
  }
});

export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
