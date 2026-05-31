import knex, { Knex } from 'knex';
import { env } from './env';

const config = require('../../knexfile.js');
export const db: Knex = knex(config[env.nodeEnv] || config.development);
