import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '@/types';
import * as bookingService from '@/services/bookingService';

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
};

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const bookings = await bookingService.getUserBookings(userId);
      return bookings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bookings');
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const bookings = await bookingService.getAllBookings();
      return bookings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch all bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (booking: Omit<Booking, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const newBooking = await bookingService.createBooking(booking);
      return newBooking;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create booking');
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ id, status }: { id: string; status: Booking['status'] }, { rejectWithValue }) => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(id, status);
      return updatedBooking;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update booking status');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user bookings
    builder.addCase(fetchUserBookings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserBookings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.bookings = action.payload;
    });
    builder.addCase(fetchUserBookings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch all bookings
    builder.addCase(fetchAllBookings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllBookings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.bookings = action.payload;
    });
    builder.addCase(fetchAllBookings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create booking
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.bookings.push(action.payload);
    });

    // Update booking status
    builder.addCase(updateBookingStatus.fulfilled, (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    });
  },
});

export const { setSelectedBooking, clearErrors } = bookingSlice.actions;
export default bookingSlice.reducer;