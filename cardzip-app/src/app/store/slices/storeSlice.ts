import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createStoreOrderApi, fetchStoreOrdersApi, fetchStoreProductsApi } from '../../services/api/storeApi';
import { CreateStoreOrderPayload, StoreOrder, StoreProduct } from '../../types/store';
import { PaginationInfo } from '../../types/pagination';

interface FetchStoreProductsArgs {
  page: number;
  append?: boolean;
  limit?: number;
}

interface FetchStoreOrdersArgs {
  token: string;
  page: number;
  append?: boolean;
  limit?: number;
}

interface StoreState {
  products: StoreProduct[];
  orders: StoreOrder[];
  productsPagination: PaginationInfo | null;
  ordersPagination: PaginationInfo | null;
  loading: boolean;
  ordersLoading: boolean;
  error: string | null;
  orderError: string | null;
}

const initialState: StoreState = {
  products: [],
  orders: [],
  productsPagination: null,
  ordersPagination: null,
  loading: false,
  ordersLoading: false,
  error: null,
  orderError: null,
};

export const fetchStoreProducts = createAsyncThunk('store/fetchProducts', async ({ page, limit = 20 }: FetchStoreProductsArgs) => {
  return fetchStoreProductsApi(page, limit);
});

export const fetchStoreOrders = createAsyncThunk('store/fetchOrders', async ({ token, page, limit = 20 }: FetchStoreOrdersArgs) => {
  return fetchStoreOrdersApi(token, page, limit);
});

export const createStoreOrder = createAsyncThunk(
  'store/createOrder',
  async ({ token, payload }: { token: string; payload: CreateStoreOrderPayload }, { rejectWithValue }) => {
    try {
      return await createStoreOrderApi(token, payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unable to place order.');
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    clearStoreError: (state) => {
      state.error = null;
      state.orderError = null;
    },
    setStoreOrders: (state, action: PayloadAction<StoreOrder[]>) => {
      state.orders = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.meta.arg.append
          ? [...state.products, ...action.payload.items]
          : action.payload.items;
        state.productsPagination = action.payload.pagination;
      })
      .addCase(fetchStoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load products.';
      })
      .addCase(fetchStoreOrders.pending, (state) => {
        state.ordersLoading = true;
        state.orderError = null;
      })
      .addCase(fetchStoreOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.meta.arg.append
          ? [...state.orders, ...action.payload.items]
          : action.payload.items;
        state.ordersPagination = action.payload.pagination;
      })
      .addCase(fetchStoreOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.orderError = action.error.message ?? 'Failed to load your orders.';
      })
      .addCase(createStoreOrder.pending, (state) => {
        state.orderError = null;
      })
      .addCase(createStoreOrder.fulfilled, (state, action) => {
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createStoreOrder.rejected, (state, action) => {
        state.orderError = typeof action.payload === 'string' ? action.payload : 'Unable to place order.';
      });
  },
});

export const { clearStoreError, setStoreOrders } = storeSlice.actions;
export default storeSlice.reducer;
