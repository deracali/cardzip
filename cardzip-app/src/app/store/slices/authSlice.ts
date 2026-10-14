import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/api/config';

export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  referralCode?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionReady: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthSession {
  user: User;
  token: string;
}

const AUTH_SESSION_KEY = 'cardzip.auth.session';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  sessionReady: false,
  loading: false,
  error: null,
};

const API_URL = `${API_BASE_URL}/api/users`;

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      const session: AuthSession = { user: data.user, token: data.token };
      await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const googleSignInUser = createAsyncThunk(
  'auth/googleSignIn',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google sign-in failed.');
      const session: AuthSession = { user: data.user, token: data.token };
      await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Google sign-in failed.');
    }
  }
);

// Async Thunk for User Signup
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (
    userData: { name: string; email: string; password: string; referrer?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const session: AuthSession = { user: data.user, token: data.token };
      await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Signup failed');
    }
  }
);

export const restoreAuthSession = createAsyncThunk<AuthSession | null>(
  'auth/restoreSession',
  async () => {
    const storedSession = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    if (!storedSession) return null;
    try {
      const session = JSON.parse(storedSession) as AuthSession;
      if (!session.token || !session.user?.id || !session.user?.name) {
        await AsyncStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Handlers
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.sessionReady = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(googleSignInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.sessionReady = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleSignInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Signup Handlers
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.sessionReady = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreAuthSession.fulfilled, (state, action: PayloadAction<AuthSession | null>) => {
        state.sessionReady = true;
        if (!action.payload) return;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(restoreAuthSession.rejected, (state) => {
        state.sessionReady = true;
      });
  },
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
  dispatch(logout());
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;