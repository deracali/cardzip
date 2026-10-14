export type WalletTransactionType = 'credit' | 'debit' | 'withdrawal';

export interface WalletBalance {
  balance: number;
  currency: string;
  updatedAt?: string;
}

export interface WalletTransaction {
  _id?: string;
  id?: string;
  user?: string;
  type: WalletTransactionType;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status?: 'pending' | 'completed' | 'failed';
  description: string;
  referenceType?: string;
  referenceId?: string | null;
  createdAt?: string;
}
