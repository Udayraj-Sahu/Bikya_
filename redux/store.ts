import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bikeReducer from './slices/bikeSlice';
import bookingReducer from './slices/bookingSlice';
import documentReducer from './slices/documentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bikes: bikeReducer,
    bookings: bookingReducer,
    documents: documentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;