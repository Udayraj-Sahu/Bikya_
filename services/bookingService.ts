// frontend/services/bookingService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, CreateBookingApiResponse, User } from '@/types'; // Import CreateBookingApiResponse

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:5000/api';

const getToken = async () => await AsyncStorage.getItem('token');

// Type for the data sent to backend to create a booking
// These are the fields the frontend provides initially.
export interface CreateBookingPayload {
  userId: string;
  bikeId: string;
  startTime: string; // ISO string
  // duration is calculated into endTime or sent as duration (e.g., in hours)
  // Let's assume backend expects startTime and endTime, or startTime and duration (in hours)
  // For now, let's match the thunk's Omit structure and add what's needed.
  // The thunk's Omit was: Omit<Booking, 'id' | 'createdAt' | 'status' | 'orderId' | 'paymentId' | 'paymentStatus' | 'userId'> & { userId: string }
  // This effectively means: bikeId, startTime, endTime, rentalDuration, totalAmount, securityDeposit
  // However, totalAmount and endTime are often calculated on backend based on duration.
  // Let's simplify: frontend sends bikeId, startTime, and duration (e.g., in hours).
  rentalDurationHours: number; // Example: duration in hours
  // totalAmount and endTime will be calculated by backend.
  // securityDeposit might be part of bike details or a fixed amount.
}

export const createBooking = async (bookingData: CreateBookingPayload): Promise<CreateBookingApiResponse> => {
  const token = await getToken();
  if (!token) throw new Error('Authentication token not found.');

  // The backend /api/bookings POST endpoint receives this data
  // and internally creates the Razorpay order and the booking document.
  // It then returns { data: { booking: Booking, order: RazorpayOrder } }
  const response = await axios.post<{ data: CreateBookingApiResponse }>(
    `${API_BASE_URL}/bookings`,
    bookingData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (response.data && response.data.data && response.data.data.booking && response.data.data.order) {
    return response.data.data;
  }
  throw new Error("Invalid response structure from create booking API.");
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const token = await getToken();
  if (!token) throw new Error('Authentication token not found.');
  // Assuming backend route /api/bookings (GET) filters by userId if not admin
  // or a specific route like /api/users/:userId/bookings
  const response = await axios.get<{ data: { bookings: Booking[] } }>(
    `${API_BASE_URL}/bookings`, // This endpoint in your backend already filters by user if not admin
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data.bookings;
};

export const getAllBookings = async (): Promise<Booking[]> => { // For Admin
  const token = await getToken();
  if (!token) throw new Error('Authentication token not found.');
  const response = await axios.get<{ data: { bookings: Booking[] } }>(
    `${API_BASE_URL}/bookings?adminView=true`, // Assuming backend filters by default, or needs a flag
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data.bookings;
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
  const token = await getToken();
  if (!token) throw new Error('Authentication token not found.');
  const response = await axios.get<{ data: { booking: Booking } }>(
    `${API_BASE_URL}/bookings/${bookingId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data.booking;
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<Booking> => {
  const token = await getToken();
  if (!token) throw new Error('Authentication token not found.');
  const response = await axios.patch<{ data: { booking: Booking } }>( // Assuming PATCH for updates
    `${API_BASE_URL}/bookings/${id}`, // Your backend uses PUT, but PATCH is common for status updates
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data.booking;
};
