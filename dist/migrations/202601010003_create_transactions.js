"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.string('reference', 40).notNullable().unique();
        table.enum('type', ['FUND', 'TRANSFER', 'WITHDRAWAL']).notNullable();
        table.enum('status', ['SUCCESS', 'FAILED']).notNullable().defaultTo('SUCCESS');
        table.integer('source_wallet_id').unsigned().nullable();
        table.integer('destination_wallet_id').unsigned().nullable();
        table.decimal('amount', 18, 2).notNullable();
        table.decimal('balance_before', 18, 2).notNullable();
        table.decimal('balance_after', 18, 2).notNullable();
        table.string('description', 255).nullable();
        table.json('metadata').nullable();
        table.timestamps(true, true);
        table.foreign('source_wallet_id').references('wallets.id').onDelete('SET NULL');
        table.foreign('destination_wallet_id').references('wallets.id').onDelete('SET NULL');
        table.index(['source_wallet_id', 'destination_wallet_id']);
        table.index(['type', 'status']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('transactions');
}
