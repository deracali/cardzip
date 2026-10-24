import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const PREFERENCES_KEY = 'cardzip.preferences';

interface PreferencesState {
  notificationsEnabled: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  notificationsEnabled: false,
  loaded: false,
  error: null,
};

type StoredPreferences = Pick<PreferencesState, 'notificationsEnabled'>;

const readPreferences = async (): Promise<StoredPreferences> => {
  const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
  if (!stored) return { notificationsEnabled: false };
  const parsed: unknown = JSON.parse(stored);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Saved preferences are invalid.');
  }
  const record = parsed as Record<string, unknown>;
  return {
    notificationsEnabled: typeof record.notificationsEnabled === 'boolean' ? record.notificationsEnabled : false,
  };
};

const writePreference = async (key: 'notificationsEnabled', value: boolean) => {
  const existing = await readPreferences();
  const next = { ...existing, [key]: value };
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  return value;
};

export const loadPreferences = createAsyncThunk('preferences/load', async () => readPreferences());

export const setNotificationsEnabled = createAsyncThunk<boolean, boolean>(
  'preferences/setNotificationsEnabled',
  async (enabled) => writePreference('notificationsEnabled', enabled)
);

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearPreferenceError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPreferences.fulfilled, (state, action) => {
        state.notificationsEnabled = Boolean(action.payload.notificationsEnabled);
        state.loaded = true;
      })
      .addCase(loadPreferences.rejected, (state) => { state.loaded = true; })
      .addCase(setNotificationsEnabled.fulfilled, (state, action) => {
        state.notificationsEnabled = action.payload;
        state.error = null;
      })
  },
});

export const { clearPreferenceError } = preferencesSlice.actions;
export default preferencesSlice.reducer;