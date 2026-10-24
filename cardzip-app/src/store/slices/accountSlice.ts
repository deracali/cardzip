import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchMyAccountApi, submitKycApi } from '../../services/api/accountApi';
import { AccountSummary, KycSubmission, KycSummary } from '../../types/account';

interface AccountState {
  summary: AccountSummary | null;
  loading: boolean;
  error: string | null;
  kycSubmitting: boolean;
  kycError: string | null;
}

const initialState: AccountState = {
  summary: null,
  loading: false,
  error: null,
  kycSubmitting: false,
  kycError: null,
};

export const fetchMyAccount = createAsyncThunk<AccountSummary, string, { rejectValue: string }>(
  'account/fetchMe',
  async (token, { rejectWithValue }) => {
    try {
      return await fetchMyAccountApi(token);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not load account details.');
    }
  }
);

export const submitKyc = createAsyncThunk<KycSummary, { token: string; submission: KycSubmission }, { rejectValue: string }>(
  'account/submitKyc',
  async ({ token, submission }, { rejectWithValue }) => {
    try {
      return await submitKycApi(token, submission);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not submit verification.');
    }
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearAccount: () => initialState,
    setAccountProfileImage: (state, action: { payload: string }) => {
      if (state.summary) state.summary.user.profileImage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchMyAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Could not load account details.';
      })
      .addCase(submitKyc.pending, (state) => {
        state.kycSubmitting = true;
        state.kycError = null;
      })
      .addCase(submitKyc.fulfilled, (state, action) => {
        state.kycSubmitting = false;
        if (state.summary) state.summary.kyc = action.payload;
      })
      .addCase(submitKyc.rejected, (state, action) => {
        state.kycSubmitting = false;
        state.kycError = action.payload ?? 'Could not submit verification.';
      });
  },
});

export const { clearAccount, setAccountProfileImage } = accountSlice.actions;
export default accountSlice.reducer;