"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('public_id', 32).notNullable().unique();
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 150).notNullable().unique();
        table.string('phone', 30).nullable().unique();
        table.string('bvn', 20).nullable().unique();
        table.timestamps(true, true);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('users');
}
