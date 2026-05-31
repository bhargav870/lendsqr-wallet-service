"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const WalletService_1 = require("../services/WalletService");
class WalletController {
    constructor(walletService = new WalletService_1.WalletService()) {
        this.walletService = walletService;
        this.getBalance = async (req, res, next) => {
            try {
                const wallet = await this.walletService.getWallet(req.params.userId);
                res.status(200).json({ status: 'success', data: wallet });
            }
            catch (error) {
                next(error);
            }
        };
        this.fund = async (req, res, next) => {
            try {
                const result = await this.walletService.fundWallet(req.params.userId, req.body.amount, req.body.description);
                res.status(200).json({ status: 'success', data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.withdraw = async (req, res, next) => {
            try {
                const result = await this.walletService.withdraw(req.params.userId, req.body.amount, req.body.description);
                res.status(200).json({ status: 'success', data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.transfer = async (req, res, next) => {
            try {
                const result = await this.walletService.transfer(req.params.userId, req.body.receiverUserId, req.body.amount, req.body.description);
                res.status(200).json({ status: 'success', data: result });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.WalletController = WalletController;
