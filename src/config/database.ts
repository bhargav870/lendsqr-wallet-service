import knex, { Knex } from 'knex';
import { env } from './env';

const knexConfig = require('../../knexfile.js');
const environment = env.nodeEnv as string;
const connectionConfig = knexConfig[environment] || knexConfig['development'];

export const db: Knex = knex(connectionConfig);
