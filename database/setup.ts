import * as fs from 'fs';
import * as path from 'path';
import pool from '../src/config/database';
import logger from '../src/config/logger';

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        logger.info(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(sql);
        logger.info(`Completed migration: ${file}`);
      }
    }

    logger.info('All migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', error);
    await pool.end();
    process.exit(1);
  }
};

runMigrations();
