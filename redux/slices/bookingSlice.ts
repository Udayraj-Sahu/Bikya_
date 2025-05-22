// @/redux/slices/bookingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, CreateBookingApiResponse, RazorpayOrder, User } from '@/types'; // Ensure User is imported if needed by CreateBookingThunkArg
import * as bookingService from '@/services/bookingService';
import * as paymentService from '@/services/paymentService'; // Assuming you have this service
import { RootState, AppDispatch } from '../store'; // <<< IMPORT RootState and AppDispatch

// Type for the data passed to createBookingThunk from UI
export interface CreateBookingThunkArg {
  userId: string;
  bikeId: string;
  startTime: string; // ISO string for start time
  rentalDurationHours: number; // Duration in hours
  // totalAmount and endTime are typically calculated by backend
}

interface PaymentVerificationThunkArg {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  isCreatingBooking: boolean;
  isVerifyingPayment: boolean;
  error: string | null;
  currentRazorpayOrder: RazorpayOrder | null;
  currentBookingIdForPayment: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  isCreatingBooking: false,
  isVerifyingPayment: false,
  error: null,
  currentRazorpayOrder: null,
  currentBookingIdForPayment: null,
};

export const fetchUserBookingsThunk = createAsyncThunk< // Renamed for clarity
  Booking[],
  string, // userId
  { rejectValue: string }
>(
  'bookings/fetchUserBookings',
  async (userId, { rejectWithValue }) => {
    try {
      const bookings = await bookingService.getUserBookings(userId);
      return bookings;
    } catch (error: any) { // Added :any for broader error catching initially
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to fetch bookings'));
    }
  }
);

export const fetchAllBookingsThunk = createAsyncThunk< // Renamed for clarity
  Booking[],
  void, // No argument
  { rejectValue: string }
>(
  'bookings/fetchAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const bookings = await bookingService.getAllBookings();
      return bookings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to fetch all bookings'));
    }
  }
);

export const createBookingThunk = createAsyncThunk< // Renamed for clarity
  CreateBookingApiResponse,
  CreateBookingThunkArg,
  { rejectValue: string }
>(
  'bookings/createBooking',
  async (bookingPayload, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingPayload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to create booking'));
    }
  }
);

export const updateBookingStatusThunk = createAsyncThunk< // Renamed for clarity
  Booking,
  { id: string; status: Booking['status'] },
  // Correctly typed ThunkApiConfig for getState and dispatch
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'bookings/updateBookingStatus',
  async ({ id, status }, { rejectWithValue, dispatch, getState }) => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(id, status);
      const authUser = getState().auth.user; // getState() is now correctly typed
      if (authUser?.role === 'admin' || authUser?.role === 'owner') {
        dispatch(fetchAllBookingsThunk());
      } else if (authUser) {
        dispatch(fetchUserBookingsThunk(authUser.id));
      }
      return updatedBooking;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to update booking status'));
    }
  }
);

export const verifyPaymentThunk = createAsyncThunk<
  { updatedBooking: Booking | null; verificationResponse: any },
  PaymentVerificationThunkArg,
  // Correctly typed ThunkApiConfig for getState and dispatch
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'bookings/verifyPayment',
  async (payload, { rejectWithValue, dispatch, getState }) => {
    try {
      const verificationResponse = await paymentService.verifyPayment(payload);
      let updatedBooking: Booking | null = null;
      try {
        // Ensure getBookingById is exported from bookingService and correctly typed
        updatedBooking = await bookingService.getBookingById(payload.bookingId);
      } catch (fetchError) {
        console.error("Failed to fetch updated booking after payment verification:", fetchError);
      }
      
      const userId = getState().auth.user?.id; // getState() is now correctly typed
      if (userId) {
        dispatch(fetchUserBookingsThunk(userId));
      }
      return { updatedBooking, verificationResponse };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Payment verification failed'));
    }
  }
);


const bookingSlice = createSlice({
  name: 'bookings', // Or 'booking' if that's what you used in store.ts
  initialState,
  reducers: {
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    clearBookingError: (state) => { // Renamed from clearErrors for clarity
      state.error = null;
    },
    setCurrentPaymentDetails: (state, action: PayloadAction<{ order: RazorpayOrder; bookingId: string }>) => {
        state.currentRazorpayOrder = action.payload.order;
        state.currentBookingIdForPayment = action.payload.bookingId;
    },
    clearCurrentPaymentDetails: (state) => {
        state.currentRazorpayOrder = null;
        state.currentBookingIdForPayment = null;
    }
  },
  extraReducers: (builder) => {
    const handleRejected = (state: BookingState, action: any) => {
        state.isLoading = false;
        state.isCreatingBooking = false;
        state.isVerifyingPayment = false;
        if (action.payload) { state.error = action.payload as string; }
        else if (action.error?.message) { state.error = action.error.message; }
        else { state.error = 'An unknown booking error occurred'; }
    };

    // Fetch user bookings
    builder
      .addCase(fetchUserBookingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchUserBookingsThunk.rejected, handleRejected);
      
    // Fetch all bookings
    builder
      .addCase(fetchAllBookingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBookingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // Decide how to handle this: merge with user bookings or separate state for admin?
        // For now, it overwrites state.bookings.
        state.bookings = action.payload; 
      })
      .addCase(fetchAllBookingsThunk.rejected, handleRejected);
      
    // Create booking
    builder
      .addCase(createBookingThunk.pending, (state) => {
        state.isCreatingBooking = true; state.error = null;
      })
      .addCase(createBookingThunk.fulfilled, (state, action: PayloadAction<CreateBookingApiResponse>) => {
        state.isCreatingBooking = false;
        state.bookings.unshift(action.payload.booking); 
        state.selectedBooking = action.payload.booking;
        state.currentRazorpayOrder = action.payload.order;
        state.currentBookingIdForPayment = action.payload.booking.id;
      })
      .addCase(createBookingThunk.rejected, handleRejected);
      
    // Update booking status
    builder
      .addCase(updateBookingStatusThunk.pending, (state) => {
         state.isLoading = true; // Or a specific isUpdatingStatus flag
         state.error = null;
      })
      .addCase(updateBookingStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(updateBookingStatusThunk.rejected, handleRejected);

    // Verify Payment
    builder
      .addCase(verifyPaymentThunk.pending, (state) => {
        state.isVerifyingPayment = true; state.error = null;
      })
      .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
        state.isVerifyingPayment = false;
        const { updatedBooking } = action.payload;
        if (updatedBooking) {
            const index = state.bookings.findIndex(b => b.id === updatedBooking.id);
            if (index !== -1) state.bookings[index] = updatedBooking;
            if (state.selectedBooking?.id === updatedBooking.id) state.selectedBooking = updatedBooking;
        }
        state.currentRazorpayOrder = null;
        state.currentBookingIdForPayment = null;
      })
      .addCase(verifyPaymentThunk.rejected, handleRejected);
  },
});

export const { setSelectedBooking, clearBookingError, setCurrentPaymentDetails, clearCurrentPaymentDetails } = bookingSlice.actions; // Renamed clearErrors
export default bookingSlice.reducer;
