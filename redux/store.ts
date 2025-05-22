// frontend/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bikeReducer from './slices/bikeSlice'; // Assuming you have this
import bookingReducer from './slices/bookingSlice'; // Assuming you have this
import documentReducer from './slices/documentSlice'; // Add this import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bike: bikeReducer, // Your existing reducers
    booking: bookingReducer, // Your existing reducers
    documents: documentReducer, // Add the new document reducer
  },
  // Middleware can be added here if needed, e.g., for logging
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
