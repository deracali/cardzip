import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import esimCatalogReducer from './slices/esimSlice';
import cartReducer, { addToCart, applyPromoCode, clearCart, removeFromCart, updateQuantity } from './slices/cartSlice';
import myEsimsReducer from './slices/myEsimsSlice';
import giftCardReducer from './slices/giftCardSlice';
import accountReducer from './slices/accountSlice';
import preferencesReducer from './slices/preferencesSlice';
import storeReducer from './slices/storeSlice';
import walletReducer from './slices/walletSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  esimCatalog: esimCatalogReducer,
  cart: cartReducer,
  myEsims: myEsimsReducer,
  giftCards: giftCardReducer,
  account: accountReducer,
  preferences: preferencesReducer,
  store: storeReducer,
  wallet: walletReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const cartPersistence = createListenerMiddleware<RootState>();
let cartPersistenceQueue = Promise.resolve();

cartPersistence.startListening({
  matcher: isAnyOf(addToCart, removeFromCart, updateQuantity, applyPromoCode, clearCart),
  effect: (_action, listenerApi) => {
    const { cart } = listenerApi.getState();
    if (!cart.loaded) return;

    const savedCart = JSON.stringify({ items: cart.items, promoCode: cart.promoCode });
    cartPersistenceQueue = cartPersistenceQueue
      .then(() => AsyncStorage.setItem('cardzip.market.cart', savedCart))
      .catch((error: unknown) => {
        console.error('Could not save the store cart:', error);
      });
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(cartPersistence.middleware),
  devTools: process.env.NODE_NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;