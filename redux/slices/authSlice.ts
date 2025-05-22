// frontend/redux/slices/authSlice.ts
import * as authService from "@/services/authService"; // Assuming this service has login, signup, getUserProfile, updateUserProfile
import { AuthState, User } from "@/types"; // Assuming these are correctly defined in @/types
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false, // Added for clarity
	isLoading: false,
	error: null,
	documentStatus: null, // Your existing field
};

// Existing Login Thunk
export const login = createAsyncThunk(
	"auth/login",
	async (
		{ email, password }: { email: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await authService.login(email, password);
			// Assuming response is { user: User, token: string }
			await AsyncStorage.setItem("token", response.token);
			await AsyncStorage.setItem("user", JSON.stringify(response.user)); // Store user object
			return response;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message ||
					(error instanceof Error ? error.message : "Login failed")
			);
		}
	}
);

// Existing Signup Thunk
export const signup = createAsyncThunk(
	"auth/signup",
	async (
		{
			fullName,
			email,
			phone,
			password,
		}: { fullName: string; email: string; phone: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await authService.signup(
				fullName,
				email,
				phone,
				password
			);
			// Assuming response is { user: User, token: string }
			await AsyncStorage.setItem("token", response.token);
			await AsyncStorage.setItem("user", JSON.stringify(response.user)); // Store user object
			return response;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message ||
					(error instanceof Error ? error.message : "Signup failed")
			);
		}
	}
);

// Thunk for fetching user profile (New)
export const fetchUserProfile = createAsyncThunk<
	User,
	void,
	{ rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue, dispatch }) => {
	try {
		const user = await authService.getUserProfile(); // This service function needs to be implemented
		await AsyncStorage.setItem("user", JSON.stringify(user)); // Update user in storage
		dispatch(setUser(user)); // Dispatch setUser to update state immediately
		return user;
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message ||
				(error instanceof Error
					? error.message
					: "Failed to fetch profile")
		);
	}
});

// Thunk for updating user profile (New)
export const updateProfile = createAsyncThunk<
	User,
	Partial<User>,
	{ rejectValue: string }
>("auth/updateProfile", async (profileData, { rejectWithValue, dispatch }) => {
	try {
		const user = await authService.updateUserProfile(profileData); // This service function needs to be implemented
		await AsyncStorage.setItem("user", JSON.stringify(user)); // Update user in storage
		dispatch(setUser(user)); // Dispatch setUser to update state immediately
		return user;
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message ||
				(error instanceof Error
					? error.message
					: "Failed to update profile")
		);
	}
});

// Existing Check Document Status Thunk
export const checkDocumentStatus = createAsyncThunk(
	"auth/checkDocumentStatus",
	async (_, { getState, rejectWithValue }) => {
		try {
			const { auth } = getState() as { auth: AuthState };
			if (!auth.user?.id)
				throw new Error("User not logged in for document check"); // More specific error

			// Ensure authService.checkDocumentStatus is implemented and returns expected status
			const status = await authService.checkDocumentStatus(auth.user.id);
			return status;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message ||
					(error instanceof Error
						? error.message
						: "Failed to check document status")
			);
		}
	}
);

// Thunk to initialize auth state from AsyncStorage (New)
export const initializeAuth = createAsyncThunk<
	Partial<AuthState> | null,
	void,
	{ rejectValue: string }
>("auth/initializeAuth", async (_, { rejectWithValue }) => {
	try {
		const token = await AsyncStorage.getItem("token");
		const userString = await AsyncStorage.getItem("user");
		if (token && userString) {
			const user: User = JSON.parse(userString);
			return { user, token, isAuthenticated: true };
		}
		return null; // No auth state to initialize
	} catch (error: any) {
		console.error("Failed to initialize auth state from storage", error);
		return rejectWithValue("Failed to load session");
	}
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.documentStatus = null; // Your existing field
			state.error = null;
			state.isLoading = false;
			AsyncStorage.removeItem("token");
			AsyncStorage.removeItem("user");
		},
		setUser: (state, action: PayloadAction<User | null>) => {
			state.user = action.payload;
			state.isAuthenticated = !!action.payload; // Set isAuthenticated based on user presence
		},
		setToken: (state, action: PayloadAction<string | null>) => {
			state.token = action.payload;
		},
		clearAuthError: (state) => {
			state.error = null;
		},
		// Corrected updateLocation reducer
		updateLocation: (
			state,
			action: PayloadAction<{ latitude: number; longitude: number }>
		) => {
			if (state.user) {
				// If state.user.location is undefined, initialize it
				if (!state.user.location) {
					state.user.location = {
						latitude: action.payload.latitude,
						longitude: action.payload.longitude,
					};
				} else {
					// Otherwise, update existing latitude and longitude
					state.user.location.latitude = action.payload.latitude;
					state.user.location.longitude = action.payload.longitude;
				}
			}
		},
	},
	extraReducers: (builder) => {
		// Initialize Auth
		builder.addCase(initializeAuth.fulfilled, (state, action) => {
			if (action.payload) {
				state.user = action.payload.user || null;
				state.token = action.payload.token || null;
				state.isAuthenticated = action.payload.isAuthenticated || false;
			}
			state.isLoading = false;
		});
		builder.addCase(initializeAuth.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(initializeAuth.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
			state.isAuthenticated = false;
			state.user = null;
			state.token = null;
		});

		// Login
		builder.addCase(login.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(login.fulfilled, (state, action) => {
			state.isLoading = false;
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.isAuthenticated = true;
		});
		builder.addCase(login.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
			state.isAuthenticated = false;
			state.user = null;
			state.token = null;
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
			state.isAuthenticated = true;
		});
		builder.addCase(signup.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
			state.isAuthenticated = false;
			state.user = null;
			state.token = null;
		});

		// Fetch User Profile
		builder.addCase(fetchUserProfile.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(
			fetchUserProfile.fulfilled,
			(state, action: PayloadAction<User>) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
			}
		);
		builder.addCase(fetchUserProfile.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Update User Profile
		builder.addCase(updateProfile.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(
			updateProfile.fulfilled,
			(state, action: PayloadAction<User>) => {
				state.isLoading = false;
				state.user = action.payload;
			}
		);
		builder.addCase(updateProfile.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Your existing Document status
		builder.addCase(checkDocumentStatus.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(checkDocumentStatus.fulfilled, (state, action) => {
			state.isLoading = false;
			state.documentStatus = action.payload;
		});
		builder.addCase(checkDocumentStatus.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});
	},
});

export const { logout, setUser, setToken, clearAuthError, updateLocation } =
	authSlice.actions;
export default authSlice.reducer;
