"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMoney = toMoney;
exports.formatMoney = formatMoney;
const decimal_js_1 = __importDefault(require("decimal.js"));
const errors_1 = require("./errors");
function toMoney(value) {
    const amount = new decimal_js_1.default(value);
    if (!amount.isFinite() || amount.lessThanOrEqualTo(0)) {
        throw new errors_1.AppError('Amount must be greater than zero', 422, 'INVALID_AMOUNT');
    }
    return amount.toDecimalPlaces(2);
}
function formatMoney(value) {
    return new decimal_js_1.default(value).toFixed(2);
}
