import { Request, Response, NextFunction } from 'express';
import { WalletService } from '../services/WalletService';

export class WalletController {
  constructor(private readonly walletService = new WalletService()) {}

  getBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await this.walletService.getWallet(req.params.userId);
      res.status(200).json({ status: 'success', data: wallet });
    } catch (error) {
      next(error);
    }
  };

  fund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.walletService.fundWallet(req.params.userId, req.body.amount, req.body.description);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  withdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.walletService.withdraw(req.params.userId, req.body.amount, req.body.description);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  transfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.walletService.transfer(
        req.params.userId,
        req.body.receiverUserId,
        req.body.amount,
        req.body.description
      );
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
