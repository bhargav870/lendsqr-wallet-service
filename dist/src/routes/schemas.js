"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSchema = exports.moneySchema = exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserSchema = joi_1.default.object({
    firstName: joi_1.default.string().trim().min(2).max(100).required(),
    lastName: joi_1.default.string().trim().min(2).max(100).required(),
    email: joi_1.default.string().trim().lowercase().email().required(),
    phone: joi_1.default.string().trim().pattern(/^\+?[0-9]{10,15}$/).optional(),
    bvn: joi_1.default.string().trim().pattern(/^[0-9]{11}$/).optional()
});
exports.moneySchema = joi_1.default.object({
    amount: joi_1.default.number().precision(2).positive().required(),
    description: joi_1.default.string().trim().max(255).optional()
});
exports.transferSchema = joi_1.default.object({
    receiverUserId: joi_1.default.string().trim().required(),
    amount: joi_1.default.number().precision(2).positive().required(),
    description: joi_1.default.string().trim().max(255).optional()
});
