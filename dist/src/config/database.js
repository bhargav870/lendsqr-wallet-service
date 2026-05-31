"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
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
exports.db = (0, knex_1.default)(connectionConfig);
