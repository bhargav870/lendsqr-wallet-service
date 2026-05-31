import knex, { Knex } from 'knex';
import config from '../../knexfile';
import { env } from './env';

export const db: Knex = knex(config[env.nodeEnv] || config.development);
