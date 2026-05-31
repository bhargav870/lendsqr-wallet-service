"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
const env_1 = require("./env");
const knexConfig = require('../../knexfile.js');
const environment = env_1.env.nodeEnv;
const connectionConfig = knexConfig[environment] || knexConfig['development'];
exports.db = (0, knex_1.default)(connectionConfig);
