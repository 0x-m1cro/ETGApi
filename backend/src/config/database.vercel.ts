// Vercel Postgres configuration
// This file provides database connectivity for Vercel deployments
// Uses @vercel/postgres which automatically handles connection pooling

import { sql } from '@vercel/postgres';
import logger from './logger';

// Query function compatible with the existing database interface
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    // @vercel/postgres uses template literals, but we'll adapt it
    // For safety, we'll use the sql.query method if available
    const res = await sql.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
};

// For Vercel, we don't need a traditional connection pool
// The @vercel/postgres package handles this automatically
export const getClient = async () => {
  throw new Error('getClient() is not supported with Vercel Postgres. Use query() instead.');
};

export default {
  query,
  getClient,
  // Mock pool methods for compatibility
  on: (event: string, _handler: (err: Error) => void) => {
    logger.debug(`Pool event handler registered: ${event}`);
  },
  end: async () => {
    logger.debug('Database connection end called (no-op for Vercel Postgres)');
  },
  ping: async () => {
    await query('SELECT 1');
  },
};
