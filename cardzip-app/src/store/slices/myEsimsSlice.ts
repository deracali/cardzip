import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PurchasedEsim, TopUpPayload, UpdateUsagePayload } from '../../types/esim';
import { purchaseEsimApi } from '../../services/api/esimApi';
import { clearCart } from './cartSlice';
import type { RootState } from '../index';

interface MyEsimsState {
  activeProfiles: PurchasedEsim[];
  purchasing: boolean;
  checkoutError: string | null;
}

const initialState: MyEsimsState = {
  activeProfiles: [],
  purchasing: false,
  checkoutError: null,
};

export const checkoutEsims = createAsyncThunk<
  PurchasedEsim[],
  void,
  { state: RootState; rejectValue: string }
>('myEsims/checkoutEsims', async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const { cart } = getState();
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    const newEsims = await purchaseEsimApi(cart.items);
    dispatch(clearCart());
    return newEsims;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Checkout failed');
  }
});

const myEsimsSlice = createSlice({
  name: 'myEsims',
  initialState,
  reducers: {
    topUpData: (state, action: PayloadAction<TopUpPayload>) => {
      const { iccid, addGB } = action.payload;
      const esim = state.activeProfiles.find((p) => p.iccid === iccid);
      if (esim) {
        esim.totalDataGB += addGB;
      }
    },
    updateDataUsage: (state, action: PayloadAction<UpdateUsagePayload>) => {
      const { iccid, usedGB } = action.payload;
      const esim = state.activeProfiles.find((p) => p.iccid === iccid);
      if (esim) {
        esim.usedDataGB = Math.min(esim.totalDataGB, usedGB);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutEsims.pending, (state) => {
        state.purchasing = true;
        state.checkoutError = null;
      })
      .addCase(checkoutEsims.fulfilled, (state, action: PayloadAction<PurchasedEsim[]>) => {
        state.purchasing = false;
        state.activeProfiles.push(...action.payload);
      })
      .addCase(checkoutEsims.rejected, (state, action) => {
        state.purchasing = false;
        state.checkoutError = action.payload || 'Checkout failed';
      });
  },
});

export const { topUpData, updateDataUsage } = myEsimsSlice.actions;
export default myEsimsSlice.reducer;