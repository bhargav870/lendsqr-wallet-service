"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const nanoid_1 = require("nanoid");
const database_1 = require("../config/database");
const KarmaService_1 = require("./KarmaService");
const errors_1 = require("../utils/errors");
class UserService {
    constructor(db = database_1.db, karmaService = new KarmaService_1.KarmaService()) {
        this.db = db;
        this.karmaService = karmaService;
    }
    async createUser(input) {
        await this.karmaService.ensureUserIsAllowed([input.email, input.phone, input.bvn]);
        const existingUser = await this.db('users')
            .where('email', input.email)
            .modify(query => {
            if (input.phone)
                query.orWhere('phone', input.phone);
            if (input.bvn)
                query.orWhere('bvn', input.bvn);
        })
            .first();
        if (existingUser) {
            throw new errors_1.AppError('A user with the same email, phone or BVN already exists', 409, 'USER_ALREADY_EXISTS');
        }
        return this.db.transaction(async (trx) => {
            const publicId = (0, nanoid_1.nanoid)(16);
            const [userId] = await trx('users').insert({
                public_id: publicId,
                first_name: input.firstName,
                last_name: input.lastName,
                email: input.email,
                phone: input.phone || null,
                bvn: input.bvn || null
            });
            await trx('wallets').insert({ user_id: Number(userId), balance: '0.00', currency: 'NGN' });
            const user = await trx('users').where({ id: Number(userId) }).first();
            const wallet = await trx('wallets').where({ user_id: Number(userId) }).first();
            return { user, wallet };
        });
    }
    async getUserByPublicId(publicId) {
        const user = await this.db('users').where({ public_id: publicId }).first();
        if (!user)
            throw new errors_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        const wallet = await this.db('wallets').where({ user_id: user.id }).first();
        return { user, wallet };
    }
}
exports.UserService = UserService;
