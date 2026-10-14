import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import esimCatalogReducer from './slices/esimSlice';
import cartReducer from './slices/cartSlice';
import myEsimsReducer from './slices/myEsimsSlice';
import giftCardReducer from './slices/giftCardSlice';
import accountReducer from './slices/accountSlice';
import preferencesReducer from './slices/preferencesSlice';
import storeReducer from './slices/storeSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    esimCatalog: esimCatalogReducer,
    cart: cartReducer,
    myEsims: myEsimsReducer,
    giftCards: giftCardReducer,
    account: accountReducer,
    preferences: preferencesReducer,
    store: storeReducer,
    wallet: walletReducer,
  },
  devTools: process.env.NODE_NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;