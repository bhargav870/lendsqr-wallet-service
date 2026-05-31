"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    apiToken: process.env.API_TOKEN || 'demo-credit-test-token',
    adjutorBaseUrl: process.env.ADJUTOR_BASE_URL || 'https://adjutor.lendsqr.com/v2',
    adjutorApiKey: process.env.ADJUTOR_API_KEY || '',
    karmaCheckEnabled: process.env.KARMA_CHECK_ENABLED !== 'false'
};
