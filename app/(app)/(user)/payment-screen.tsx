// app/(app)/(user)/payment-screen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { verifyPaymentThunk, clearBookingError, clearCurrentPaymentDetails } from '@/redux/slices/bookingSlice';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react-native';

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

export default function PaymentScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    razorpayOrderId: string;
    bookingId: string;
    amount: string; 
    currency: string;
    userName: string;
    userEmail: string;
    userPhone: string;
  }>();

  const { 
    razorpayOrderId, 
    bookingId, 
    amount: amountString, // Renamed to avoid confusion
    currency,
    userName,
    userEmail,
    userPhone 
  } = params;

  const { isVerifyingPayment, error: bookingError, selectedBooking } = useAppSelector(state => state.bookings);
  const appName = "Bikya"; 

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'processing'>('pending');

  useEffect(() => {
    if (!RAZORPAY_KEY_ID) {
      Alert.alert("Configuration Error", "Razorpay Key ID is missing. Payment cannot proceed.");
      setPaymentStatus('failed');
      console.error("RAZORPAY_KEY_ID is not set in environment variables.");
      return;
    }
    if (!razorpayOrderId || !bookingId || !amountString || !currency) {
      Alert.alert("Error", "Payment details are incomplete. Please try booking again.", [{text: "OK", onPress: () => router.back()}]);
      setPaymentStatus('failed');
      return;
    }
    
    handlePayment();

    return () => {
        dispatch(clearBookingError());
    }
  }, [razorpayOrderId, bookingId, amountString, currency]);


  const handlePayment = () => {
    if (!RAZORPAY_KEY_ID || !razorpayOrderId || !amountString || !currency || !bookingId) {
        Alert.alert("Error", "Cannot initiate payment due to missing details.");
        setPaymentStatus('failed');
        return;
    }
    setPaymentStatus('processing');

    const numericAmount = parseInt(amountString, 10); 
    if (isNaN(numericAmount)) {
        Alert.alert("Error", "Invalid amount for payment.");
        setPaymentStatus('failed');
        return;
    }

    const options = {
      description: `Booking for ${appName}`,
      image: 'https://placehold.co/200x200/007AFF/FFFFFF?text=Bikya', 
      currency: currency, 
      key: RAZORPAY_KEY_ID,
      amount: numericAmount, // <<< CORRECTED: Pass as number
      order_id: razorpayOrderId,
      name: appName,
      prefill: {
        email: userEmail || 'guest@example.com',
        contact: userPhone || '9999999999',
        name: userName || 'Guest User',
      },
      theme: { color: Colors.light.tint || '#007AFF' },
      notes: {
        booking_id: bookingId, 
      }
    };

    console.log("Razorpay Options:", options); // Log options before calling open

    RazorpayCheckout.open(options)
      .then(async (data :  any) => { 
        console.log('Razorpay Success Response:', data);
        setPaymentStatus('processing'); 
        const verificationPayload = {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
          bookingId: bookingId,
        };
        const resultAction = await dispatch(verifyPaymentThunk(verificationPayload));

        if (verifyPaymentThunk.fulfilled.match(resultAction)) {
          setPaymentStatus('success');
          Alert.alert('Payment Successful!', 'Your booking is confirmed.');
        } else {
          setPaymentStatus('failed');
          Alert.alert('Payment Verification Failed', resultAction.payload as string || 'Could not verify payment with server.');
        }
      })
      .catch((error: any) => { 
        setPaymentStatus('failed');
        console.error('Razorpay Error Response:', error);
        Alert.alert(
          `Payment ${error.code === 0 ? 'Cancelled' : 'Failed'}`, 
          error.description || 'An error occurred during payment.'
        );
      });
  };

  const navigateToBookings = () => {
    router.replace('/(app)/(user)/bookings'); 
    dispatch(clearCurrentPaymentDetails()); 
  };

  if (!razorpayOrderId || !bookingId || !amountString || !currency) {
    return (
      <View style={[styles.container, styles.centered]}>
        <AlertTriangle size={48} color="orange" />
        <Text style={styles.statusText}>Missing payment details. Please go back and try again.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, styles.centered]}>
      {paymentStatus === 'processing' || isVerifyingPayment ? (
        <>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.statusText}>Processing your payment, please wait...</Text>
        </>
      ) : paymentStatus === 'success' ? (
        <>
          <CheckCircle size={64} color="green" />
          <Text style={styles.statusTextSuccess}>Payment Successful!</Text>
          <Text style={styles.infoText}>Your booking is confirmed.</Text>
          <Text style={styles.infoText}>Booking ID: {bookingId}</Text>
          {selectedBooking && <Text style={styles.infoText}>Status: {selectedBooking.status}</Text>}
          <Button title="View My Bookings" onPress={navigateToBookings} style={styles.actionButton} />
        </>
      ) : paymentStatus === 'failed' ? (
        <>
          <AlertTriangle size={64} color="red" />
          <Text style={styles.statusTextError}>Payment Failed</Text>
          {bookingError && <Text style={styles.errorTextSmall}>{bookingError}</Text>}
          <Text style={styles.infoText}>Please try again or contact support.</Text>
          <Button title="Try Again" onPress={handlePayment} style={styles.actionButton} />
          <Button title="Go Back to Booking" onPress={() => router.back()} type="outline" style={styles.actionButton} />
        </>
      ) : (
         <Text style={styles.statusText}>Preparing payment...</Text> 
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: Colors.light.text,
  },
  statusTextSuccess: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'green',
  },
  statusTextError: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.textMuted,
    marginTop: 8,
    marginBottom: 15,
  },
  errorTextSmall: {
    fontSize: 14,
    textAlign: 'center',
    color: 'red',
    marginVertical: 5,
  },
  actionButton: {
    marginTop: 15,
    width: '80%',
  }
});
