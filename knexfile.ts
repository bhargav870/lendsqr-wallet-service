import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Record<string, Knex.Config> = {
  development: {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      socketPath: process.env.DB_SOCKET || '/tmp/mysql.sock',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lendsqr_wallet'
    },
    migrations: { directory: './migrations', extension: 'ts' }
  },
  test: {
    client: 'mysql2',
    connection: {
      host: process.env.TEST_DB_HOST || process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.TEST_DB_PORT || process.env.DB_PORT || 3306),
      user: process.env.TEST_DB_USER || process.env.DB_USER || 'wallet_user',
      password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'wallet_password',
      database: process.env.TEST_DB_NAME || 'wallet_service_test'
    },
    migrations: { directory: './migrations', extension: 'ts' }
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: './migrations', extension: 'ts' }
  }
};

export default config;
module.exports = config;
