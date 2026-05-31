"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestDb = createTestDb;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
async function createTestDb() {
    const db = (0, knex_1.default)(knexfile_1.default.test);
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
    return db;
}
