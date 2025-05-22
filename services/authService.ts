// frontend/services/authService.ts
import { DocumentApprovalStatus, User } from "@/types"; // Import your types
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.2:5000/api"; // Your correct URL

// Helper to get the token
const getToken = async () => {
	return await AsyncStorage.getItem("token");
};

// --- Login ---
interface LoginResponse {
	token: string;
	user: User;
}
export const login = async (
	email: string,
	password: string
): Promise<LoginResponse> => {
	const url = `${API_BASE_URL}/auth/login`;
	console.log(`Attempting login for ${email} to URL: ${url}`);
	try {
		const response = await axios.post(url, {
			email,
			password,
		});
		console.log("Login service raw response:", response.data);
		// Adjust based on your backend's actual response structure
		if (
			response.data.token &&
			response.data.data &&
			response.data.data.user
		) {
			const loginData = {
				token: response.data.token,
				user: response.data.data.user,
			};
			console.log("Login service returning:", loginData);
			return loginData;
		} else if (response.data.token && response.data.user) {
			// Fallback for flatter structure
			const loginData = {
				token: response.data.token,
				user: response.data.user,
			};
			console.log("Login service returning (fallback):", loginData);
			return loginData;
		}
		console.error(
			"Failed to parse token/user from login response in authService:",
			response.data
		);
		throw new Error(
			"Invalid login response structure from server (authService)."
		);
	} catch (error: any) {
		if (error.response) {
			console.error(
				"Login service error - Server Response:",
				JSON.stringify(error.response.data, null, 2)
			);
			console.error(
				"Login service error - Status Code:",
				error.response.status
			);
		} else if (error.request) {
			console.error("Login service error - No Response:", error.request);
		} else {
			console.error(
				"Login service error - Request Setup:",
				error.message
			);
		}
		throw error;
	}
};

// --- Signup ---
interface SignupResponse {
	token: string;
	user: User;
}
export const signup = async (
	fullName: string,
	email: string,
	phone: string,
	password: string
): Promise<SignupResponse> => {
	const url = `${API_BASE_URL}/auth/signup`;
	console.log(`Attempting signup for ${email} to URL: ${url} with data:`, {
		fullName,
		email,
		phone /* no password in log */,
	});
	try {
		const response = await axios.post(url, {
			fullName,
			email,
			phone,
			password,
		});
		console.log("Signup service raw response:", response.data); // You confirmed this shows token and user

		// Backend response structure: response.data = { token: "...", data: { user: {...} }, success: true }
		if (
			response.data &&
			typeof response.data.token === "string" &&
			response.data.data &&
			response.data.data.user
		) {
			const signupData = {
				token: response.data.token,
				user: response.data.data.user,
			};
			console.log(
				"AuthService signup IS RETURNING THIS (should have token):",
				signupData
			); // <<< CRITICAL LOG
			return signupData;
		} else {
			// This block should ideally not be hit if raw response is correct
			console.error(
				"Failed to parse token/user from signup response in authService. Structure was:",
				response.data
			);
			throw new Error(
				"Invalid signup response structure from server (authService parsing failed)."
			);
		}
	} catch (error: any) {
		if (error.response) {
			console.error(
				"Signup service error - Server Response:",
				JSON.stringify(error.response.data, null, 2)
			);
			console.error(
				"Signup service error - Status Code:",
				error.response.status
			);
		} else if (error.request) {
			console.error("Signup service error - No Response:", error.request);
		} else {
			console.error(
				"Signup service error - Request Setup:",
				error.message
			);
		}
		// console.error('Full signup service error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2)); // Already logged this
		throw error;
	}
};

// --- Get User Profile ---
export const getUserProfile = async (): Promise<User> => {
	const token = await getToken();
	if (!token) throw new Error("No token found for getUserProfile");
	const response = await axios.get<{ data: { user: User } }>(
		`${API_BASE_URL}/users/profile`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	if (response.data && response.data.data && response.data.data.user) {
		return response.data.data.user;
	}
	throw new Error("Invalid user profile response from server.");
};

// --- Update User Profile ---
export const updateUserProfile = async (
	profileData: Partial<User>
): Promise<User> => {
	const token = await getToken();
	if (!token) throw new Error("No token found for updateUserProfile");
	const response = await axios.patch<{ data: { user: User } }>(
		`${API_BASE_URL}/users/profile`,
		profileData,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	if (response.data && response.data.data && response.data.data.user) {
		return response.data.data.user;
	}
	throw new Error("Invalid update profile response from server.");
};

// --- Check Document Status ---
export const checkDocumentStatus = async (
	userId: string
): Promise<DocumentApprovalStatus> => {
	const token = await getToken();
	if (!token) throw new Error("No token found for checkDocumentStatus");
	try {
		const response = await axios.get<{
			data: { documents: Array<{ status: DocumentApprovalStatus }> };
		}>(`${API_BASE_URL}/users/documents`, {
			// Assuming endpoint to get user's documents
			headers: { Authorization: `Bearer ${token}` },
		});
		const documents = response.data.data.documents;
		if (documents && documents.length > 0) {
			if (documents.some((doc) => doc.status === "approved"))
				return "approved";
			if (documents.some((doc) => doc.status === "pending"))
				return "pending";
			if (documents.some((doc) => doc.status === "rejected"))
				return "rejected";
		}
		return null;
	} catch (error) {
		console.error("Error in checkDocumentStatus service:", error);
		throw error;
	}
};
