import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Bike } from '@/types';
import * as bikeService from '@/services/bikeService';

interface BikeState {
  bikes: Bike[];
  featuredBikes: Bike[];
  selectedBike: Bike | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BikeState = {
  bikes: [],
  featuredBikes: [],
  selectedBike: null,
  isLoading: false,
  error: null,
};

export const fetchBikes = createAsyncThunk(
  'bikes/fetchBikes',
  async (_, { rejectWithValue }) => {
    try {
      const bikes = await bikeService.getBikes();
      return bikes;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bikes');
    }
  }
);

export const fetchBikesByLocation = createAsyncThunk(
  'bikes/fetchBikesByLocation',
  async ({ latitude, longitude }: { latitude: number; longitude: number }, { rejectWithValue }) => {
    try {
      const bikes = await bikeService.getBikesByLocation(latitude, longitude);
      return bikes;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bikes by location');
    }
  }
);

export const addBike = createAsyncThunk(
  'bikes/addBike',
  async (bike: Omit<Bike, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const newBike = await bikeService.addBike(bike);
      return newBike;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add bike');
    }
  }
);

export const updateBike = createAsyncThunk(
  'bikes/updateBike',
  async ({ id, bike }: { id: string; bike: Partial<Bike> }, { rejectWithValue }) => {
    try {
      const updatedBike = await bikeService.updateBike(id, bike);
      return updatedBike;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update bike');
    }
  }
);

export const deleteBike = createAsyncThunk(
  'bikes/deleteBike',
  async (id: string, { rejectWithValue }) => {
    try {
      await bikeService.deleteBike(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete bike');
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
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all bikes
    builder.addCase(fetchBikes.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBikes.fulfilled, (state, action) => {
      state.isLoading = false;
      state.bikes = action.payload;
      // Set featured bikes (for example, first 5 bikes)
      state.featuredBikes = action.payload.slice(0, 5);
    });
    builder.addCase(fetchBikes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch bikes by location
    builder.addCase(fetchBikesByLocation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBikesByLocation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.bikes = action.payload;
      state.featuredBikes = action.payload.slice(0, 5);
    });
    builder.addCase(fetchBikesByLocation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add bike
    builder.addCase(addBike.fulfilled, (state, action) => {
      state.bikes.push(action.payload);
    });

    // Update bike
    builder.addCase(updateBike.fulfilled, (state, action) => {
      const index = state.bikes.findIndex(bike => bike.id === action.payload.id);
      if (index !== -1) {
        state.bikes[index] = action.payload;
      }
    });

    // Delete bike
    builder.addCase(deleteBike.fulfilled, (state, action) => {
      state.bikes = state.bikes.filter(bike => bike.id !== action.payload);
    });
  },
});

export const { setSelectedBike, clearErrors } = bikeSlice.actions;
export default bikeSlice.reducer;