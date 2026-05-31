import { Knex } from 'knex';
import { nanoid } from 'nanoid';
import { db as defaultDb } from '../config/database';
import { KarmaService } from './KarmaService';
import { AppError } from '../utils/errors';

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bvn?: string;
}

export class UserService {
  constructor(
    private readonly db: Knex = defaultDb,
    private readonly karmaService: KarmaService = new KarmaService()
  ) {}

  async createUser(input: CreateUserInput) {
    await this.karmaService.ensureUserIsAllowed([input.email, input.phone, input.bvn]);

    const existingUser = await this.db('users')
      .where('email', input.email)
      .modify(query => {
        if (input.phone) query.orWhere('phone', input.phone);
        if (input.bvn) query.orWhere('bvn', input.bvn);
      })
      .first();

    if (existingUser) {
      throw new AppError('A user with the same email, phone or BVN already exists', 409, 'USER_ALREADY_EXISTS');
    }

    return this.db.transaction(async trx => {
      const publicId = nanoid(16);
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

  async getUserByPublicId(publicId: string) {
    const user = await this.db('users').where({ public_id: publicId }).first();
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    const wallet = await this.db('wallets').where({ user_id: user.id }).first();
    return { user, wallet };
  }
}
