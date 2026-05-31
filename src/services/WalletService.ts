import Decimal from 'decimal.js';
import { Knex } from 'knex';
import { nanoid } from 'nanoid';
import { db as defaultDb } from '../config/database';
import { AppError } from '../utils/errors';
import { formatMoney, toMoney } from '../utils/money';

export class WalletService {
  constructor(private readonly db: Knex = defaultDb) {}

  async fundWallet(userPublicId: string, amountValue: number, description?: string) {
    const amount = toMoney(amountValue);

    return this.db.transaction(async trx => {
      const wallet = await this.getWalletByUserPublicId(trx, userPublicId, true);
      const before = new Decimal(wallet.balance);
      const after = before.plus(amount);

      await trx('wallets').where({ id: wallet.id }).update({ balance: formatMoney(after), updated_at: trx.fn.now() });
      await this.recordTransaction(trx, {
        type: 'FUND',
        destination_wallet_id: wallet.id,
        amount: formatMoney(amount),
        balance_before: formatMoney(before),
        balance_after: formatMoney(after),
        description: description || 'Wallet funding'
      });

      return { balance: formatMoney(after) };
    });
  }

  async withdraw(userPublicId: string, amountValue: number, description?: string) {
    const amount = toMoney(amountValue);

    return this.db.transaction(async trx => {
      const wallet = await this.getWalletByUserPublicId(trx, userPublicId, true);
      const before = new Decimal(wallet.balance);
      this.ensureSufficientBalance(before, amount);
      const after = before.minus(amount);

      await trx('wallets').where({ id: wallet.id }).update({ balance: formatMoney(after), updated_at: trx.fn.now() });
      await this.recordTransaction(trx, {
        type: 'WITHDRAWAL',
        source_wallet_id: wallet.id,
        amount: formatMoney(amount),
        balance_before: formatMoney(before),
        balance_after: formatMoney(after),
        description: description || 'Wallet withdrawal'
      });

      return { balance: formatMoney(after) };
    });
  }

  async transfer(senderPublicId: string, receiverPublicId: string, amountValue: number, description?: string) {
    if (senderPublicId === receiverPublicId) {
      throw new AppError('Sender and receiver cannot be the same user', 422, 'INVALID_TRANSFER');
    }

    const amount = toMoney(amountValue);

    return this.db.transaction(async trx => {
      const senderWallet = await this.getWalletByUserPublicId(trx, senderPublicId, true);
      const receiverWallet = await this.getWalletByUserPublicId(trx, receiverPublicId, true);
      const senderBefore = new Decimal(senderWallet.balance);
      const receiverBefore = new Decimal(receiverWallet.balance);
      this.ensureSufficientBalance(senderBefore, amount);

      const senderAfter = senderBefore.minus(amount);
      const receiverAfter = receiverBefore.plus(amount);

      await trx('wallets').where({ id: senderWallet.id }).update({ balance: formatMoney(senderAfter), updated_at: trx.fn.now() });
      await trx('wallets').where({ id: receiverWallet.id }).update({ balance: formatMoney(receiverAfter), updated_at: trx.fn.now() });

      await this.recordTransaction(trx, {
        type: 'TRANSFER',
        source_wallet_id: senderWallet.id,
        destination_wallet_id: receiverWallet.id,
        amount: formatMoney(amount),
        balance_before: formatMoney(senderBefore),
        balance_after: formatMoney(senderAfter),
        description: description || 'Wallet transfer'
      });

      return { senderBalance: formatMoney(senderAfter), receiverBalance: formatMoney(receiverAfter) };
    });
  }

  async getWallet(userPublicId: string) {
    return this.getWalletByUserPublicId(this.db, userPublicId, false);
  }

  private ensureSufficientBalance(balance: Decimal, amount: Decimal): void {
    if (balance.lessThan(amount)) {
      throw new AppError('Insufficient wallet balance', 422, 'INSUFFICIENT_FUNDS');
    }
  }

  private async getWalletByUserPublicId(trx: Knex | Knex.Transaction, publicId: string, lock: boolean) {
    const user = await trx('users').where({ public_id: publicId }).first();
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const query = trx('wallets').where({ user_id: user.id });
    if (lock && 'forUpdate' in query) query.forUpdate();

    const wallet = await query.first();
    if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');

    return wallet;
  }

  private async recordTransaction(trx: Knex.Transaction, payload: Record<string, unknown>) {
    await trx('transactions').insert({
      reference: `TXN_${nanoid(18)}`,
      status: 'SUCCESS',
      ...payload
    });
  }
}
