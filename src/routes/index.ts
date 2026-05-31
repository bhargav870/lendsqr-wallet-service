import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { WalletController } from '../controllers/WalletController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createUserSchema, moneySchema, transferSchema } from './schemas';

const router = Router();
const userController = new UserController();
const walletController = new WalletController();

router.get('/health', (_req, res) => res.status(200).json({ status: 'success', message: 'Wallet service is running' }));

router.use(authenticate);
router.post('/users', validateBody(createUserSchema), userController.create);
router.get('/users/:userId', userController.show);
router.get('/users/:userId/wallet', walletController.getBalance);
router.post('/users/:userId/wallet/fund', validateBody(moneySchema), walletController.fund);
router.post('/users/:userId/wallet/withdraw', validateBody(moneySchema), walletController.withdraw);
router.post('/users/:userId/wallet/transfer', validateBody(transferSchema), walletController.transfer);

export default router;
