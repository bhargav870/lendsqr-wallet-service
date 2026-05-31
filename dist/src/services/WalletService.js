"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const nanoid_1 = require("nanoid");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const money_1 = require("../utils/money");
class WalletService {
    constructor(db = database_1.db) {
        this.db = db;
    }
    async fundWallet(userPublicId, amountValue, description) {
        const amount = (0, money_1.toMoney)(amountValue);
        return this.db.transaction(async (trx) => {
            const wallet = await this.getWalletByUserPublicId(trx, userPublicId, true);
            const before = new decimal_js_1.default(wallet.balance);
            const after = before.plus(amount);
            await trx('wallets').where({ id: wallet.id }).update({ balance: (0, money_1.formatMoney)(after), updated_at: trx.fn.now() });
            await this.recordTransaction(trx, {
                type: 'FUND',
                destination_wallet_id: wallet.id,
                amount: (0, money_1.formatMoney)(amount),
                balance_before: (0, money_1.formatMoney)(before),
                balance_after: (0, money_1.formatMoney)(after),
                description: description || 'Wallet funding'
            });
            return { balance: (0, money_1.formatMoney)(after) };
        });
    }
    async withdraw(userPublicId, amountValue, description) {
        const amount = (0, money_1.toMoney)(amountValue);
        return this.db.transaction(async (trx) => {
            const wallet = await this.getWalletByUserPublicId(trx, userPublicId, true);
            const before = new decimal_js_1.default(wallet.balance);
            this.ensureSufficientBalance(before, amount);
            const after = before.minus(amount);
            await trx('wallets').where({ id: wallet.id }).update({ balance: (0, money_1.formatMoney)(after), updated_at: trx.fn.now() });
            await this.recordTransaction(trx, {
                type: 'WITHDRAWAL',
                source_wallet_id: wallet.id,
                amount: (0, money_1.formatMoney)(amount),
                balance_before: (0, money_1.formatMoney)(before),
                balance_after: (0, money_1.formatMoney)(after),
                description: description || 'Wallet withdrawal'
            });
            return { balance: (0, money_1.formatMoney)(after) };
        });
    }
    async transfer(senderPublicId, receiverPublicId, amountValue, description) {
        if (senderPublicId === receiverPublicId) {
            throw new errors_1.AppError('Sender and receiver cannot be the same user', 422, 'INVALID_TRANSFER');
        }
        const amount = (0, money_1.toMoney)(amountValue);
        return this.db.transaction(async (trx) => {
            const senderWallet = await this.getWalletByUserPublicId(trx, senderPublicId, true);
            const receiverWallet = await this.getWalletByUserPublicId(trx, receiverPublicId, true);
            const senderBefore = new decimal_js_1.default(senderWallet.balance);
            const receiverBefore = new decimal_js_1.default(receiverWallet.balance);
            this.ensureSufficientBalance(senderBefore, amount);
            const senderAfter = senderBefore.minus(amount);
            const receiverAfter = receiverBefore.plus(amount);
            await trx('wallets').where({ id: senderWallet.id }).update({ balance: (0, money_1.formatMoney)(senderAfter), updated_at: trx.fn.now() });
            await trx('wallets').where({ id: receiverWallet.id }).update({ balance: (0, money_1.formatMoney)(receiverAfter), updated_at: trx.fn.now() });
            await this.recordTransaction(trx, {
                type: 'TRANSFER',
                source_wallet_id: senderWallet.id,
                destination_wallet_id: receiverWallet.id,
                amount: (0, money_1.formatMoney)(amount),
                balance_before: (0, money_1.formatMoney)(senderBefore),
                balance_after: (0, money_1.formatMoney)(senderAfter),
                description: description || 'Wallet transfer'
            });
            return { senderBalance: (0, money_1.formatMoney)(senderAfter), receiverBalance: (0, money_1.formatMoney)(receiverAfter) };
        });
    }
    async getWallet(userPublicId) {
        return this.getWalletByUserPublicId(this.db, userPublicId, false);
    }
    ensureSufficientBalance(balance, amount) {
        if (balance.lessThan(amount)) {
            throw new errors_1.AppError('Insufficient wallet balance', 422, 'INSUFFICIENT_FUNDS');
        }
    }
    async getWalletByUserPublicId(trx, publicId, lock) {
        const user = await trx('users').where({ public_id: publicId }).first();
        if (!user)
            throw new errors_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        const query = trx('wallets').where({ user_id: user.id });
        if (lock && 'forUpdate' in query)
            query.forUpdate();
        const wallet = await query.first();
        if (!wallet)
            throw new errors_1.AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
        return wallet;
    }
    async recordTransaction(trx, payload) {
        await trx('transactions').insert({
            reference: `TXN_${(0, nanoid_1.nanoid)(18)}`,
            status: 'SUCCESS',
            ...payload
        });
    }
}
exports.WalletService = WalletService;
