"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('API security', () => {
    it('rejects protected routes without token', async () => {
        const response = await (0, supertest_1.default)((0, app_1.createApp)()).post('/api/v1/users').send({});
        expect(response.status).toBe(401);
    });
});
