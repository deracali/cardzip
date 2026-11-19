import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/api/config';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
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
  sessionExpired: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthSession {
  user: User;
  token: string;
}

interface RestoredAuthSession {
  session: AuthSession | null;
  expired: boolean;
}

const AUTH_SESSION_KEY = 'cardzip.auth.session';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  sessionReady: false,
  sessionExpired: false,
  loading: false,
  error: null,
};

const API_URL = `${API_BASE_URL}/api/users`;

const isTokenExpired = (token: string): boolean => {
  const encodedPayload = token.split('.')[1];
  if (!encodedPayload) return true;

  try {
    const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: unknown };
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

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

export const appleSignInUser = createAsyncThunk(
  'auth/appleSignIn',
  async (credentials: { idToken: string; name?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Apple sign-in failed.');
      const session: AuthSession = { user: data.user, token: data.token };
      await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Apple sign-in failed.');
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

export const restoreAuthSession = createAsyncThunk<RestoredAuthSession>(
  'auth/restoreSession',
  async () => {
    const storedSession = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    if (!storedSession) return { session: null, expired: false };
    try {
      const session = JSON.parse(storedSession) as AuthSession;
      if (!session.token || !session.user?.id || !session.user?.name) {
        await AsyncStorage.removeItem(AUTH_SESSION_KEY);
        return { session: null, expired: false };
      }
      if (isTokenExpired(session.token)) {
        await AsyncStorage.removeItem(AUTH_SESSION_KEY);
        return { session: null, expired: true };
      }
      return { session, expired: false };
    } catch {
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      return { session: null, expired: false };
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
      state.sessionExpired = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUserProfileImage: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.profileImage = action.payload;
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
        state.sessionExpired = false;
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
        state.sessionExpired = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleSignInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(appleSignInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appleSignInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.sessionReady = true;
        state.sessionExpired = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(appleSignInUser.rejected, (state, action) => {
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
        state.sessionExpired = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreAuthSession.fulfilled, (state, action: PayloadAction<RestoredAuthSession>) => {
        state.sessionReady = true;
        state.sessionExpired = action.payload.expired;
        if (!action.payload.session) return;
        state.user = action.payload.session.user;
        state.token = action.payload.session.token;
        state.isAuthenticated = true;
      })
      .addCase(restoreAuthSession.rejected, (state) => {
        state.sessionReady = true;
        state.sessionExpired = false;
      });
  },
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
  dispatch(logout());
});

export const { logout, clearError, setUserProfileImage } = authSlice.actions;
export default authSlice.reducer;