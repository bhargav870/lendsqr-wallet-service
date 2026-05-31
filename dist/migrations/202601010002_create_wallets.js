"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('wallets', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().unique();
        table.decimal('balance', 18, 2).notNullable().defaultTo(0);
        table.string('currency', 3).notNullable().defaultTo('NGN');
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('wallets');
}
