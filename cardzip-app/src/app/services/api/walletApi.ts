import { WalletBalance, WalletTransaction } from '../../types/wallet';
import { PaginatedList, PaginationInfo } from '../../types/pagination';
import { API_BASE_URL } from './config';

const defaultPagination = (page: number, limit: number, totalItems: number): PaginationInfo => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
  hasNextPage: false,
  hasPreviousPage: page > 1,
});

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (body && typeof body === 'object' && 'data' in body) return body.data as T;
  return body as T;
};

export interface SavedBankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface WithdrawalRequest {
  _id: string;
  reference: string;
  amount: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: 'failed' | 'pending' | 'approved' | 'rejected' | 'completed';
  riskStatus: 'clear' | 'failed';
  riskReason?: string;
  createdAt: string;
}

export interface WithdrawalResponse {
  request: WithdrawalRequest;
  balance: number;
  currency: string;
  transaction?: WalletTransaction;
}

export const fetchWalletAccountApi = async (token: string): Promise<{ user: { bankAccount: SavedBankAccount | null } }> => {
  return request<{ user: { bankAccount: SavedBankAccount | null } }>('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchWalletBalanceApi = async (token: string): Promise<WalletBalance> => {
  return request<WalletBalance>(`/api/wallet/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const saveBankAccountApi = async (token: string, account: SavedBankAccount): Promise<SavedBankAccount> => {
  return request<SavedBankAccount>('/api/users/me/bank-account', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(account),
  });
};

export const fetchWithdrawalHistoryApi = async (token: string): Promise<WithdrawalRequest[]> => {
  return request<WithdrawalRequest[]>('/api/wallet/withdrawals?page=1&limit=10', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchWalletHistoryApi = async (token: string, page = 1, limit = 20): Promise<PaginatedList<WalletTransaction>> => {
  const response = await fetch(`${API_BASE_URL}/api/wallet/history?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body
      ? String(body.message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  const data = body && typeof body === 'object' && 'data' in body ? body.data : body;
  const items = Array.isArray(data) ? data as WalletTransaction[] : [];
  const pagination = body?.pagination as PaginationInfo | undefined;
  return {
    items,
    pagination: pagination ?? defaultPagination(page, limit, items.length),
  };
};

export const withdrawWalletApi = async (token: string, amount: number, bankName: string, accountName: string, accountNumber: string): Promise<WithdrawalResponse> => {
  return request<WithdrawalResponse>(`/api/wallet/withdraw`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount, bankName, accountName, accountNumber }),
  });
};
