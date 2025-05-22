// frontend/services/paymentService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '@/types'; // Assuming Booking type is defined

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:5000/api'; // Your correct URL

// Helper to get the token
const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string; // Your internal booking ID
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    paymentId: string;
    orderId: string;
    status: Booking['status']; // e.g., 'confirmed'
  };
}

export const verifyPayment = async (payload: PaymentVerificationPayload): Promise<PaymentVerificationResponse> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for payment verification');

  console.log('Verifying payment with backend. Payload:', payload);
  const response = await axios.post(`${API_BASE_URL}/payments/verify`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // Assuming backend returns: { success: true, message: '...', data: { ... } }
  return response.data; 
};

// You might also have a function here to create a Razorpay order if you decide to separate
// that logic from the initial booking creation, but for now, createBooking in bookingService handles it.
