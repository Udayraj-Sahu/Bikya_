// frontend/services/authService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, DocumentApprovalStatus } from '@/types'; // Import your types

// Define your API base URL. It's good practice to use environment variables.
// For Expo, you can use EXPO_PUBLIC_ prefix for environment variables.
// Example: process.env.EXPO_PUBLIC_API_URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://your-backend-api-url/api'; // Replace with your actual API URL

// Helper to get the token
const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

// --- Login ---
interface LoginResponse {
  token: string;
  user: User;
}
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  // Assuming your backend returns { data: { token: '...', user: {...} } } or similar
  return response.data.data || response.data; // Adjust based on your actual backend response structure
};

// --- Signup ---
interface SignupResponse {
  token: string;
  user: User;
}
export const signup = async (fullName: string, email: string, phone: string, password: string): Promise<SignupResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
    fullName,
    email,
    phone,
    password,
  });
  return response.data.data || response.data; // Adjust based on your actual backend response structure
};

// --- Get User Profile ---
export const getUserProfile = async (): Promise<User> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for getUserProfile');
  const response = await axios.get(`${API_BASE_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.user; // Adjust based on your actual backend response structure
};

// --- Update User Profile ---
export const updateUserProfile = async (profileData: Partial<User>): Promise<User> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for updateUserProfile');
  const response = await axios.patch(`${API_BASE_URL}/users/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.user; // Adjust based on your actual backend response structure
};

// --- Check Document Status ---
// The return type here depends on what your backend sends for document status.
// It might be a simple string, or an object. Let's assume DocumentApprovalStatus for now.
export const checkDocumentStatus = async (userId: string): Promise<DocumentApprovalStatus> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for checkDocumentStatus');
  
  // Example: Your backend might have an endpoint like /users/documents/status
  // Adjust the endpoint and response parsing as needed.
  // This is a placeholder, as the exact endpoint for "overall document status" wasn't specified.
  // Often, document status is part of the user profile or fetched from a documents endpoint.
  // If it's part of the user profile, fetchUserProfile might already cover it.
  // If you have a dedicated endpoint, use it here.
  
  // For now, let's assume it's part of the user object or you have a specific endpoint.
  // If it's on the user object, this function might not be needed separately if fetchUserProfile gets it.
  // If there's a dedicated endpoint:
  // const response = await axios.get(`${API_BASE_URL}/users/${userId}/documents/overall-status`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return response.data.data.status; // Adjust

  // Placeholder: If document status is derived from the user object (e.g., user.idProofApproved)
  // then this thunk might fetch the user profile and extract the status.
  // Or, if you have a specific endpoint that returns just the status:
  console.warn("authService.checkDocumentStatus needs a specific backend endpoint or logic to determine overall document status.");
  // Example: Fetching the user's documents and checking their status
  const documentsResponse = await axios.get(`${API_BASE_URL}/users/documents`, { // Assuming an endpoint to get user's documents
     headers: { Authorization: `Bearer ${token}` },
  });
  const documents = documentsResponse.data.data.documents; // Adjust path to documents array
  if (documents && documents.length > 0) {
    const approvedDoc = documents.find((doc: any) => doc.status === 'approved');
    if (approvedDoc) return 'approved';
    const pendingDoc = documents.find((doc: any) => doc.status === 'pending');
    if (pendingDoc) return 'pending';
    const rejectedDoc = documents.find((doc: any) => doc.status === 'rejected');
    if (rejectedDoc) return 'rejected';
  }
  return null; // Or 'pending' if no documents submitted yet, depending on logic
};

// You might add other auth-related services here, like:
// - forgotPassword
// - resetPassword
// - verifyOtp (if you implement OTP)
