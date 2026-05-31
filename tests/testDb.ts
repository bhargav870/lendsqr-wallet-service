import knex, { Knex } from 'knex';
import config from '../knexfile';

export async function createTestDb(): Promise<Knex> {
  const db = knex(config.test);
  await db.migrate.rollback(undefined, true);
  await db.migrate.latest();
  return db;
}
