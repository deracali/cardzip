import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EsimPlan, CartItem } from '../../types/esim';

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  promoCode: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Partial<CartItem> & { id: string; price: number }>) => {
      const payload = action.payload;
      const itemId = payload.id;
      const normalizedItem: CartItem = {
        ...payload,
        id: itemId,
        price: Number(payload.price ?? 0),
        quantity: Number(payload.quantity ?? 1),
        name: payload.name ?? payload.title ?? payload.country ?? 'Product',
        title: payload.title ?? payload.name ?? payload.country ?? 'Product',
        image: payload.image ?? '',
      };

      const existingItem = state.items.find((item) => item.id === itemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push(normalizedItem);
      }
      cartSlice.caseReducers.recalculateTotals(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      cartSlice.caseReducers.recalculateTotals(state);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      cartSlice.caseReducers.recalculateTotals(state);
    },
    applyPromoCode: (state, action: PayloadAction<string>) => {
      if (action.payload === 'WELCOME10') {
        state.promoCode = 'WELCOME10';
        state.discount = 0.10;
      }
      cartSlice.caseReducers.recalculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.discount = 0;
      state.promoCode = null;
    },
    recalculateTotals: (state) => {
      const rawSubtotal = state.items.reduce(
        (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0),
        0
      );
      state.subtotal = rawSubtotal - rawSubtotal * state.discount;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, applyPromoCode, clearCart } = cartSlice.actions;
export default cartSlice.reducer;