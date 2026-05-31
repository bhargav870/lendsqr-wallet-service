import { createTestDb } from './testDb';
import { UserService } from '../src/services/UserService';
import { WalletService } from '../src/services/WalletService';

const karma = { ensureUserIsAllowed: jest.fn().mockResolvedValue(undefined) } as any;

describe('WalletService', () => {
  let db: any;
  let userService: UserService;
  let walletService: WalletService;
  let userA: string;
  let userB: string;

  beforeEach(async () => {
    db = await createTestDb();
    userService = new UserService(db, karma);
    walletService = new WalletService(db);

    const a = await userService.createUser({ firstName: 'Amina', lastName: 'One', email: 'amina@example.com' });
    const b = await userService.createUser({ firstName: 'Bola', lastName: 'Two', email: 'bola@example.com' });
    userA = a.user.public_id;
    userB = b.user.public_id;
  });

  afterEach(async () => {
    await db.destroy();
  });

  it('funds a wallet', async () => {
    const result = await walletService.fundWallet(userA, 5000);
    expect(result.balance).toBe('5000.00');
  });

  it('transfers funds atomically between two wallets', async () => {
    await walletService.fundWallet(userA, 5000);
    const result = await walletService.transfer(userA, userB, 1250);

    expect(result.senderBalance).toBe('3750.00');
    expect(result.receiverBalance).toBe('1250.00');

    const transactions = await db('transactions').where({ type: 'TRANSFER' });
    expect(transactions).toHaveLength(1);
  });

  it('rejects transfer when sender has insufficient funds', async () => {
    await expect(walletService.transfer(userA, userB, 100)).rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' });
  });

  it('withdraws from wallet and rejects overdraft', async () => {
    await walletService.fundWallet(userA, 1000);
    const result = await walletService.withdraw(userA, 300);

    expect(result.balance).toBe('700.00');
    await expect(walletService.withdraw(userA, 800)).rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' });
  });
});
