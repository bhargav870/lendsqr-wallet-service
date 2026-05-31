export type TransactionType = 'FUND' | 'TRANSFER' | 'WITHDRAWAL';
export type TransactionStatus = 'SUCCESS' | 'FAILED';

export interface User {
  id: number;
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  bvn: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: string;
  currency: string;
  created_at: Date;
  updated_at: Date;
}
