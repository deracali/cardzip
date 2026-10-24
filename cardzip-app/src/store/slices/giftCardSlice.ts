import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice';
import {
  createGiftCardTradeApi,
  fetchGiftCardsApi,
  fetchGiftCardTradesApi,
} from '../../services/api/giftCardApi';
import { PaginationInfo, PaginatedList } from '../../types/pagination';
import {
  CreateGiftCardTradePayload,
  FetchGiftCardsArgs,
  FetchGiftCardTradesArgs,
  GiftCard,
  GiftCardTrade,
} from '../../types/giftCard';

interface GiftCardState {
  catalog: GiftCard[];
  transactions: GiftCardTrade[];
  catalogPagination: PaginationInfo | null;
  transactionsPagination: PaginationInfo | null;
  catalogLoading: boolean;
  transactionsLoading: boolean;
  submittingTrade: boolean;
  catalogError: string | null;
  transactionsError: string | null;
  tradeError: string | null;
}

const initialState: GiftCardState = {
  catalog: [],
  transactions: [],
  catalogPagination: null,
  transactionsPagination: null,
  catalogLoading: false,
  transactionsLoading: false,
  submittingTrade: false,
  catalogError: null,
  transactionsError: null,
  tradeError: null,
};

export const fetchGiftCards = createAsyncThunk<PaginatedList<GiftCard>, FetchGiftCardsArgs, { rejectValue: string }>(
  'giftCards/fetchCatalog',
  async (args, { rejectWithValue }) => {
    try {
      return await fetchGiftCardsApi(args);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not load gift cards.');
    }
  }
);

export const fetchGiftCardTrades = createAsyncThunk<PaginatedList<GiftCardTrade>, FetchGiftCardTradesArgs, { rejectValue: string }>(
  'giftCards/fetchTrades',
  async (args, { rejectWithValue }) => {
    try {
      return await fetchGiftCardTradesApi(args);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not load recent transactions.');
    }
  }
);

export const submitGiftCardTrade = createAsyncThunk<GiftCardTrade, CreateGiftCardTradePayload, { rejectValue: string }>(
  'giftCards/submitTrade',
  async (payload, { rejectWithValue }) => {
    try {
      return await createGiftCardTradeApi(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not submit gift-card trade.');
    }
  }
);

const giftCardSlice = createSlice({
  name: 'giftCards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGiftCards.pending, (state) => {
        state.catalogLoading = true;
        state.catalogError = null;
      })
      .addCase(fetchGiftCards.fulfilled, (state, action) => {
        state.catalogLoading = false;
        state.catalog = action.meta.arg.append
          ? [...state.catalog, ...action.payload.items]
          : action.payload.items;
        state.catalogPagination = action.payload.pagination;
      })
      .addCase(fetchGiftCards.rejected, (state, action) => {
        state.catalogLoading = false;
        state.catalogError = action.payload ?? 'Could not load gift cards.';
      })
      .addCase(fetchGiftCardTrades.pending, (state) => {
        state.transactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(fetchGiftCardTrades.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.meta.arg.append
          ? [...state.transactions, ...action.payload.items]
          : action.payload.items;
        state.transactionsPagination = action.payload.pagination;
      })
      .addCase(fetchGiftCardTrades.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.transactionsError = action.payload ?? 'Could not load recent transactions.';
      })
      .addCase(submitGiftCardTrade.pending, (state) => {
        state.submittingTrade = true;
        state.tradeError = null;
      })
      .addCase(submitGiftCardTrade.fulfilled, (state, action) => {
        state.submittingTrade = false;
        if (action.payload.id) state.transactions = [action.payload, ...state.transactions].slice(0, 15);
      })
      .addCase(submitGiftCardTrade.rejected, (state, action) => {
        state.submittingTrade = false;
        state.tradeError = action.payload ?? 'Could not submit gift-card trade.';
      })
      .addCase(logout, (state) => {
        state.transactions = [];
        state.transactionsPagination = null;
        state.transactionsError = null;
      });
  },
});

export default giftCardSlice.reducer;