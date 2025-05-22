// frontend/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, DocumentApprovalStatus } from '@/types';
import * as authService from '@/services/authService';
import { RootState, AppDispatch } from '../store'; // <<< IMPORT RootState and AppDispatch

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  documentStatus: null,
};

// Login Thunk
export const login = createAsyncThunk<
  { user: User, token: string }, // Return type
  { email: string; password: string }, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      if (response && typeof response.token === 'string' && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        return response;
      } else {
        console.error('Login response missing token or user:', response);
        return rejectWithValue('Login failed: Invalid server response.');
      }
    } catch (error: any) {
      console.error('Login thunk caught error:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Signup Thunk
export const signup = createAsyncThunk<
  { user: User, token: string }, // Return type
  { fullName: string; email: string; phone: string; password: string }, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
  'auth/signup',
  async ({ fullName, email, phone, password }, { rejectWithValue }) => {
  try {
      const response = await authService.signup(fullName, email, phone, password);
      // CRITICAL CHECK: Ensure response.token is a string before using it
      if (response && typeof response.token === 'string' && response.user) { // <--- THIS CHECK IS FAILING
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        return response; 
      } else {
        // This means the backend didn't send a token or the service didn't parse it correctly
        console.error('Signup response missing token or user:', response); // <--- THIS LOG SHOULD APPEAR
        return rejectWithValue('Signup failed: Invalid server response. Token missing.'); // <--- THIS IS THE ERROR MESSAGE
      }
    } catch (error: any) {
      console.error('Signup thunk caught error:', error);
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// fetchUserProfile Thunk
export const fetchUserProfile = createAsyncThunk<
  User, // Return type
  void, // Argument type
  { rejectValue: string; dispatch: AppDispatch } // ThunkAPI config
>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const user = await authService.getUserProfile();
      if (user && user.id) { 
        await AsyncStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
        return user;
      } else {
        console.error('FetchUserProfile received invalid user data:', user);
        return rejectWithValue('Failed to fetch profile: Invalid user data from server.');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to fetch profile'));
    }
  }
);

// updateProfile Thunk
export const updateProfile = createAsyncThunk<
  User, // Return type
  Partial<User>, // Argument type
  { rejectValue: string; dispatch: AppDispatch } // ThunkAPI config
>(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const user = await authService.updateUserProfile(profileData);
      if (user && user.id) { 
        await AsyncStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
        return user;
      } else {
        console.error('UpdateProfile received invalid user data:', user);
        return rejectWithValue('Failed to update profile: Invalid user data from server.');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to update profile'));
    }
  }
);

// Check Document Status Thunk - CORRECTED
export const checkDocumentStatus = createAsyncThunk<
  DocumentApprovalStatus, // Return type
  void, // Argument type (no direct input to the thunk itself)
  { state: RootState; rejectValue: string } // ThunkAPI config with RootState
>(
  'auth/checkDocumentStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState(); // state is now correctly typed as RootState
      const auth = state.auth;   // auth is now correctly typed as AuthState
      
      if (!auth.user?.id) {
        console.warn('User not logged in for document check, or user.id is missing.');
        return rejectWithValue('User not logged in for document check');
      }
      
      const status = await authService.checkDocumentStatus(auth.user.id); 
      return status;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to check document status'));
    }
  }
);

// Initialize Auth Thunk
export const initializeAuth = createAsyncThunk<
  Partial<AuthState> | null, // Return type
  void, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
    'auth/initializeAuth',
    async (_, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userString = await AsyncStorage.getItem('user');
            if (token && typeof token === 'string' && userString && typeof userString === 'string') {
                try {
                    const user: User = JSON.parse(userString);
                    if (user && user.id) { 
                        return { user, token, isAuthenticated: true };
                    }
                } catch (parseError) {
                    console.error("Failed to parse user from storage", parseError);
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    return rejectWithValue('Session data corrupted.');
                }
            }
            return null; 
        } catch (error: any) {
            console.error("Failed to initialize auth state from storage", error);
            return rejectWithValue('Failed to load session');
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
      state.isAuthenticated = false;
      state.documentStatus = null; 
      state.error = null;
      state.isLoading = false;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload; 
    },
    setToken: (state, action: PayloadAction<string | null>) => { 
        state.token = action.payload;
    },
    clearAuthError: (state) => { 
        state.error = null;
    },
    updateLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      if (state.user) {
        if (!state.user.location) {
          state.user.location = { 
            latitude: action.payload.latitude, 
            longitude: action.payload.longitude 
          };
        } else {
          state.user.location.latitude = action.payload.latitude;
          state.user.location.longitude = action.payload.longitude;
        }
      }
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (state: AuthState, action: any) => { // state is AuthState here
        state.isLoading = false;
        if (action.payload) { 
            state.error = action.payload as string;
        } else if (action.error && action.error.message) { 
            state.error = action.error.message;
        } else {
            state.error = 'An unknown error occurred';
        }
    };
    
    // Initialize Auth
    builder
        .addCase(initializeAuth.pending, (state) => { state.isLoading = true; })
        .addCase(initializeAuth.fulfilled, (state, action) => {
            if (action.payload) {
                state.user = action.payload.user || null;
                state.token = action.payload.token || null;
                state.isAuthenticated = action.payload.isAuthenticated || false;
            } else { 
                state.user = null; state.token = null; state.isAuthenticated = false;
            }
            state.isLoading = false;
        })
        .addCase(initializeAuth.rejected, (state, action) => {
            handleRejected(state, action);
            state.isAuthenticated = false; state.user = null; state.token = null;
        });

    // Login
    builder
        .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
        .addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        })
        .addCase(login.rejected, (state, action) => {
            handleRejected(state, action);
            state.isAuthenticated = false; state.user = null; state.token = null;
        });

    // Signup
    builder
        .addCase(signup.pending, (state) => { state.isLoading = true; state.error = null; })
        .addCase(signup.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        })
        .addCase(signup.rejected, (state, action) => {
            handleRejected(state, action);
            state.isAuthenticated = false; state.user = null; state.token = null;
        });

    // Fetch User Profile
    builder
        .addCase(fetchUserProfile.pending, (state) => { state.isLoading = true; state.error = null; })
        .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.user = action.payload;
            state.isAuthenticated = true; 
        })
        .addCase(fetchUserProfile.rejected, handleRejected);

    // Update User Profile
    builder
        .addCase(updateProfile.pending, (state) => { state.isLoading = true; state.error = null; })
        .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.user = action.payload; 
        })
        .addCase(updateProfile.rejected, handleRejected);

    // Document status
    builder
        .addCase(checkDocumentStatus.pending, (state) => { 
            state.isLoading = true; // Or a specific loading flag for this
            state.error = null;
        })
        .addCase(checkDocumentStatus.fulfilled, (state, action: PayloadAction<DocumentApprovalStatus>) => {
            state.isLoading = false;
            state.documentStatus = action.payload; 
        })
        .addCase(checkDocumentStatus.rejected, handleRejected);
  },
});

export const { logout, setUser, setToken, clearAuthError, updateLocation } = authSlice.actions;
export default authSlice.reducer;
