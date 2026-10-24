import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EsimPlan } from '../../types/esim';
import { fetchAvailablePlansApi } from '../../services/api/esimApi';

interface EsimCatalogState {
  plans: EsimPlan[];
  selectedCountry: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: EsimCatalogState = {
  plans: [],
  selectedCountry: 'ALL',
  searchQuery: '',
  loading: false,
  error: null,
};

export const fetchEsimPlans = createAsyncThunk<EsimPlan[], void, { rejectValue: string }>(
  'esimCatalog/fetchEsimPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAvailablePlansApi();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch eSIM plans');
    }
  }
);

const esimSlice = createSlice({
  name: 'esimCatalog',
  initialState,
  reducers: {
    setSelectedCountry: (state, action: PayloadAction<string>) => {
      state.selectedCountry = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearFilters: (state) => {
      state.selectedCountry = 'ALL';
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEsimPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEsimPlans.fulfilled, (state, action: PayloadAction<EsimPlan[]>) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchEsimPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { setSelectedCountry, setSearchQuery, clearFilters } = esimSlice.actions;
export default esimSlice.reducer;