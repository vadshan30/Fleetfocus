import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../../services/vehicleService';

const initialState = {
  items: [],
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  },
  loading: false,
  error: null,
};

// Async thunk for fetching vehicles
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchAll',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const data = await vehicleService.getAll(page, size);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || [];
        state.pagination = {
          currentPage: action.payload.number || 0,
          totalPages: action.payload.totalPages || 0,
          totalElements: action.payload.totalElements || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch vehicles';
      });
  },
});

export default vehicleSlice.reducer;