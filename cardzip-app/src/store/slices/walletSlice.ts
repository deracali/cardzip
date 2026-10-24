import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchWalletBalanceApi, fetchWalletHistoryApi, withdrawWalletApi } from '../../services/api/walletApi';
import { WalletBalance, WalletTransaction } from '../../types/wallet';
import { PaginationInfo } from '../../types/pagination';

interface FetchWalletHistoryArgs {
  token: string;
  page: number;
  append?: boolean;
  limit?: number;
}

interface WalletState {
  balance: number;
  currency: string;
  history: WalletTransaction[];
  historyPagination: PaginationInfo | null;
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  currency: 'NGN',
  history: [],
  historyPagination: null,
  loading: false,
  historyLoading: false,
  error: null,
};

export const fetchWalletBalance = createAsyncThunk('wallet/fetchBalance', async (token: string) => {
  const wallet = await fetchWalletBalanceApi(token);
  return wallet;
});

export const fetchWalletHistory = createAsyncThunk('wallet/fetchHistory', async ({ token, page, limit = 20 }: FetchWalletHistoryArgs) => {
  return fetchWalletHistoryApi(token, page, limit);
});

export const withdrawWallet = createAsyncThunk(
  'wallet/withdraw',
  async (
    { token, amount, bankName, accountName, accountNumber }:
      { token: string; amount: number; bankName: string; accountName: string; accountNumber: string },
    { rejectWithValue },
  ) => {
    try {
      const result = await withdrawWalletApi(token, amount, bankName, accountName, accountNumber);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Withdrawal failed.');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    setWalletBalance: (state, action: { payload: WalletBalance }) => {
      state.balance = action.payload.balance;
      state.currency = action.payload.currency;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.currency = action.payload.currency;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unable to load wallet.';
      })
      .addCase(fetchWalletHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchWalletHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.meta.arg.append
          ? [...state.history, ...action.payload.items]
          : action.payload.items;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(fetchWalletHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.error.message ?? 'Unable to load wallet history.';
      })
      .addCase(withdrawWallet.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.currency = action.payload.currency ?? state.currency;
        if (action.payload.transaction) {
          state.history = [action.payload.transaction, ...state.history];
        }
      })
      .addCase(withdrawWallet.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Withdrawal failed.';
      });
  },
});

export const { clearWalletError, setWalletBalance } = walletSlice.actions;
export default walletSlice.reducer;
