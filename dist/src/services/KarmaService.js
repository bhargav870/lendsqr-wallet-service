"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
class KarmaService {
    constructor(client) {
        this.client = client || axios_1.default.create({
            baseURL: env_1.env.adjutorBaseUrl,
            timeout: 8000,
            headers: env_1.env.adjutorApiKey ? { Authorization: `Bearer ${env_1.env.adjutorApiKey}` } : undefined
        });
    }
    async ensureUserIsAllowed(identities) {
        if (!env_1.env.karmaCheckEnabled)
            return;
        const values = identities.filter((identity) => Boolean(identity));
        for (const identity of values) {
            const blacklisted = await this.isBlacklisted(identity);
            if (blacklisted) {
                throw new errors_1.AppError('User cannot be onboarded because a matching identity exists on Lendsqr Karma blacklist', 403, 'KARMA_BLACKLISTED');
            }
        }
    }
    async isBlacklisted(identity) {
        if (!env_1.env.adjutorApiKey)
            return false;
        try {
            const response = await this.client.get(`/verification/karma/${encodeURIComponent(identity)}`);
            return response.data?.status === 'success' && Boolean(response.data?.data);
        }
        catch (error) {
            if (error.response?.status === 404)
                return false;
            throw new errors_1.AppError('Unable to complete Karma blacklist check', 502, 'KARMA_CHECK_FAILED');
        }
    }
}
exports.KarmaService = KarmaService;
