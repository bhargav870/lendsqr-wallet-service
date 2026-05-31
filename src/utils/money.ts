import Decimal from 'decimal.js';
import { AppError } from './errors';

export function toMoney(value: number | string): Decimal {
  const amount = new Decimal(value);
  if (!amount.isFinite() || amount.lessThanOrEqualTo(0)) {
    throw new AppError('Amount must be greater than zero', 422, 'INVALID_AMOUNT');
  }
  return amount.toDecimalPlaces(2);
}

export function formatMoney(value: Decimal | number | string): string {
  return new Decimal(value).toFixed(2);
}
