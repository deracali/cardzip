import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types/esim';

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  loaded: boolean;
}

const CART_STORAGE_KEY = 'cardzip.market.cart';

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  promoCode: null,
  loaded: false,
};

interface PersistedCart {
  items: CartItem[];
  promoCode: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const normalizeCartItem = (value: unknown): CartItem | null => {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) return null;
  const price = Number(value.price);
  const quantity = Number(value.quantity);
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(quantity) || quantity < 1) return null;

  return {
    id: value.id,
    productId: typeof value.productId === 'string' ? value.productId : undefined,
    selectedColor: typeof value.selectedColor === 'string' ? value.selectedColor : undefined,
    price,
    quantity: Math.floor(quantity),
    name: typeof value.name === 'string' ? value.name : undefined,
    title: typeof value.title === 'string' ? value.title : undefined,
    image: typeof value.image === 'string' ? value.image : '',
    country: typeof value.country === 'string' ? value.country : undefined,
    code: typeof value.code === 'string' ? value.code : undefined,
    dataAmountGB: typeof value.dataAmountGB === 'number' ? value.dataAmountGB : undefined,
    durationDays: typeof value.durationDays === 'number' ? value.durationDays : undefined,
    operator: typeof value.operator === 'string' ? value.operator : undefined,
  };
};

export const loadCart = createAsyncThunk<PersistedCart>('cart/load', async () => {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return { items: [], promoCode: null };
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
      throw new Error('Saved cart data has an invalid format.');
    }
    const items = parsed.items.map(normalizeCartItem);
    if (items.some((item) => item === null)) {
      throw new Error('Saved cart contains invalid items.');
    }
    return {
      items: items.filter((item): item is CartItem => item !== null),
      promoCode: parsed.promoCode === 'WELCOME10' ? 'WELCOME10' : null,
    };
  } catch (error) {
    console.error('Could not load the saved store cart:', error);
    throw error;
  }
});

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
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.promoCode = action.payload.promoCode;
        state.discount = action.payload.promoCode === 'WELCOME10' ? 0.10 : 0;
        state.loaded = true;
        cartSlice.caseReducers.recalculateTotals(state);
      })
      .addCase(loadCart.rejected, (state) => {
        state.loaded = true;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, applyPromoCode, clearCart } = cartSlice.actions;
export default cartSlice.reducer;