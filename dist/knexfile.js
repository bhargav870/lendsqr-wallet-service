require('dotenv').config();

const production = {
  client: 'mysql2',
  connection: process.env.JAWSDB_URL,
  pool: { min: 2, max: 10 },
  migrations: { directory: './dist/migrations' }
};

const development = {
  client: 'mysql2',
  connection: {
    socketPath: process.env.DB_SOCKET || '/tmp/mysql.sock',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lendsqr_wallet'
  },
  migrations: { directory: './dist/migrations' }
};

module.exports = { development, production, test: development };
