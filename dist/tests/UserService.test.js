"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testDb_1 = require("./testDb");
const UserService_1 = require("../src/services/UserService");
const errors_1 = require("../src/utils/errors");
const allowedKarma = { ensureUserIsAllowed: jest.fn().mockResolvedValue(undefined) };
const blockedKarma = { ensureUserIsAllowed: jest.fn().mockRejectedValue(new errors_1.AppError('blocked', 403, 'KARMA_BLACKLISTED')) };
describe('UserService', () => {
    let db;
    beforeEach(async () => {
        db = await (0, testDb_1.createTestDb)();
    });
    afterEach(async () => {
        await db.destroy();
        jest.clearAllMocks();
    });
    it('creates a user and a wallet after Karma check passes', async () => {
        const service = new UserService_1.UserService(db, allowedKarma);
        const result = await service.createUser({
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            phone: '+2347012345678',
            bvn: '22212345678'
        });
        expect(result.user.email).toBe('ada@example.com');
        expect(Number(result.wallet.balance)).toBe(0);
        expect(allowedKarma.ensureUserIsAllowed).toHaveBeenCalledWith(['ada@example.com', '+2347012345678', '22212345678']);
    });
    it('does not onboard a blacklisted user', async () => {
        const service = new UserService_1.UserService(db, blockedKarma);
        await expect(service.createUser({
            firstName: 'Bad',
            lastName: 'Actor',
            email: 'bad@example.com'
        })).rejects.toMatchObject({ code: 'KARMA_BLACKLISTED' });
        const users = await db('users');
        expect(users).toHaveLength(0);
    });
});
