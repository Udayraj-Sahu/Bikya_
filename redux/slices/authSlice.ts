import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import * as authService from '@/services/authService';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  documentStatus: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (
    { fullName, email, phone, password }: { fullName: string; email: string; phone: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.signup(fullName, email, phone, password);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
    }
  }
);

export const checkDocumentStatus = createAsyncThunk(
  'auth/checkDocumentStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.user?.id) throw new Error('User not logged in');
      
      const status = await authService.checkDocumentStatus(auth.user.id);
      return status;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check document status');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.documentStatus = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      if (state.user) {
        state.user.location = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Signup
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Document status
    builder.addCase(checkDocumentStatus.fulfilled, (state, action) => {
      state.documentStatus = action.payload;
    });
  },
});

export const { logout, setUser, updateLocation } = authSlice.actions;
export default authSlice.reducer;