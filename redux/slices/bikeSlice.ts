// frontend/redux/slices/bikeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as bikeService from '@/services/bikeService';
import { Bike } from '@/types';
// Assuming RootState and AppDispatch are correctly typed and exported from your store file
import { RootState, AppDispatch } from '../store'; // Adjust path if store.ts is elsewhere

type LocationParamsType = { latitude: number; longitude: number; maxDistance?: number };

interface BikeState {
  bikes: Bike[]; 
  allBikesAdmin: Bike[]; 
  selectedBike: Bike | null;
  isLoading: boolean;
  isMutating: boolean; 
  error: string | null; 
}

const initialState: BikeState = {
  bikes: [],
  allBikesAdmin: [],
  selectedBike: null,
  isLoading: false,
  isMutating: false,
  error: null,
};

// --- Thunks for User ---
export const fetchAvailableBikesThunk = createAsyncThunk<
  Bike[], 
  LocationParamsType | undefined, 
  { rejectValue: string } 
>(
  'bikes/fetchAvailable',
  async (locationParams, { rejectWithValue }) => { 
    try {
      const bikes = await bikeService.getAllAvailableBikes(locationParams);
      return bikes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch available bikes');
    }
  }
);

export const fetchBikeDetailsThunk = createAsyncThunk<
  Bike, 
  string, 
  { rejectValue: string } 
>(
  'bikes/fetchDetails',
  async (bikeId, { rejectWithValue }) => {
    try {
      const bike = await bikeService.getBikeDetails(bikeId);
      return bike;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch bike details');
    }
  }
);

// --- Thunks for Admin ---
export const fetchAllBikesForAdminThunk = createAsyncThunk<
  Bike[], 
  void, 
  { rejectValue: string } 
>(
  'bikes/fetchAllForAdmin',
  async (_, { rejectWithValue }) => { 
    try {
      const bikes = await bikeService.getAllBikesForAdmin();
      return bikes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch all bikes for admin');
    }
  }
);

type AddBikePayload = Omit<Bike, 'id' | 'createdBy' | 'createdAt'>;
export const addBikeThunk = createAsyncThunk<
  Bike, 
  AddBikePayload, 
  { rejectValue: string; dispatch: AppDispatch } 
>(
  'bikes/addBike',
  async (bikeData, { rejectWithValue, dispatch }) => {
    try {
      const newBike = await bikeService.addBike(bikeData);
      dispatch(fetchAllBikesForAdminThunk()); 
      return newBike;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add bike');
    }
  }
);

type UpdateBikePayload = { bikeId: string; bikeData: Partial<Omit<Bike, 'id' | 'createdBy' | 'createdAt'>> };
export const updateBikeThunk = createAsyncThunk<
  Bike, 
  UpdateBikePayload, 
  { rejectValue: string; dispatch: AppDispatch; getState: () => RootState } 
>(
  'bikes/updateBike',
  async ({ bikeId, bikeData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const updatedBike = await bikeService.updateBike(bikeId, bikeData);
      dispatch(fetchAllBikesForAdminThunk()); 
      return updatedBike;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update bike');
    }
  }
);

export const deleteBikeThunk = createAsyncThunk<
  string, 
  string, 
  { rejectValue: string; dispatch: AppDispatch } 
>(
  'bikes/deleteBike',
  async (bikeId, { rejectWithValue, dispatch }) => {
    try {
      await bikeService.deleteBike(bikeId);
      dispatch(fetchAllBikesForAdminThunk()); 
      return bikeId; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete bike');
    }
  }
);


const bikeSlice = createSlice({
  name: 'bikes',
  initialState,
  reducers: {
    setSelectedBike: (state, action: PayloadAction<Bike | null>) => {
      state.selectedBike = action.payload;
    },
    clearBikeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Corrected: Removed WritableDraft type from state parameter here
    const handleRejected = (state: BikeState, action: any) => { 
        state.isLoading = false;
        state.isMutating = false;
        if (action.payload) { 
            state.error = action.payload;
        } else if (action.error && action.error.message) { 
            state.error = action.error.message;
        } else {
            state.error = 'An unknown error occurred';
        }
    };
    
    // Fetch Available Bikes (User)
    builder
      .addCase(fetchAvailableBikesThunk.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchAvailableBikesThunk.fulfilled, (state, action: PayloadAction<Bike[]>) => {
        state.isLoading = false; state.bikes = action.payload;
      })
      .addCase(fetchAvailableBikesThunk.rejected, handleRejected);

    // Fetch Bike Details (User)
    builder
      .addCase(fetchBikeDetailsThunk.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchBikeDetailsThunk.fulfilled, (state, action: PayloadAction<Bike>) => {
        state.isLoading = false; state.selectedBike = action.payload;
      })
      .addCase(fetchBikeDetailsThunk.rejected, handleRejected);

    // Fetch All Bikes (Admin)
    builder
      .addCase(fetchAllBikesForAdminThunk.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchAllBikesForAdminThunk.fulfilled, (state, action: PayloadAction<Bike[]>) => {
        state.isLoading = false; state.allBikesAdmin = action.payload;
      })
      .addCase(fetchAllBikesForAdminThunk.rejected, handleRejected);

    // Add Bike (Admin)
    builder
      .addCase(addBikeThunk.pending, (state) => {
        state.isMutating = true; state.error = null;
      })
      .addCase(addBikeThunk.fulfilled, (state, action: PayloadAction<Bike>) => {
        state.isMutating = false;
      })
      .addCase(addBikeThunk.rejected, handleRejected);

    // Update Bike (Admin)
    builder
      .addCase(updateBikeThunk.pending, (state) => {
        state.isMutating = true; state.error = null;
      })
      .addCase(updateBikeThunk.fulfilled, (state, action: PayloadAction<Bike>) => {
        state.isMutating = false;
        if (state.selectedBike?.id === action.payload.id) {
            state.selectedBike = action.payload; 
        }
      })
      .addCase(updateBikeThunk.rejected, handleRejected);

    // Delete Bike (Admin)
    builder
      .addCase(deleteBikeThunk.pending, (state) => {
        state.isMutating = true; state.error = null;
      })
      .addCase(deleteBikeThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isMutating = false;
        if (state.selectedBike?.id === action.payload) {
            state.selectedBike = null; 
        }
      })
      .addCase(deleteBikeThunk.rejected, handleRejected);
  },
});

export const { setSelectedBike, clearBikeError } = bikeSlice.actions;
export default bikeSlice.reducer;
