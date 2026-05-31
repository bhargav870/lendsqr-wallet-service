import knex, { Knex } from 'knex';

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = isProduction && process.env.JAWSDB_URL ? {
  client: 'mysql2',
  connection: process.env.JAWSDB_URL,
  pool: { min: 2, max: 10 }
} : {
  client: 'mysql2',
  connection: {
    socketPath: process.env.DB_SOCKET || '/tmp/mysql.sock',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lendsqr_wallet'
  }
};

export const db: Knex = knex(connectionConfig);
