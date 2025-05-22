// app/(app)/(user)/create-booking.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TextInput, Platform,TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  createBookingThunk,
  clearBookingError,
  setCurrentPaymentDetails, // We'll use this if createBookingThunk doesn't set it directly enough
} from '@/redux/slices/bookingSlice';
import { fetchUserProfile } from '@/redux/slices/authSlice'; // To re-check user details
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // For start time
import { Clock, CalendarDays, Info } from 'lucide-react-native';

export default function CreateBookingScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ 
    bikeId: string; 
    pricePerHour: string; 
    pricePerDay: string;
  }>();
  
  const { bikeId, pricePerHour: pricePerHourString, pricePerDay: pricePerDayString } = params;

  const authUser = useAppSelector(state => state.auth.user);
  const { 
    isCreatingBooking, 
    error: bookingError, 
    currentRazorpayOrder, // Will be populated after createBookingThunk success
    currentBookingIdForPayment 
  } = useAppSelector(state => state.bookings); // Assuming 'bookings' is the key for bookingSlice

  const [rentalDurationHours, setRentalDurationHours] = useState('1'); // Default to 1 hour
  const [startTime, setStartTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // Default to 1 hour from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const parsedPricePerHour = useMemo(() => parseFloat(pricePerHourString || '0'), [pricePerHourString]);
  const parsedPricePerDay = useMemo(() => parseFloat(pricePerDayString || '0'), [pricePerDayString]);

  const totalAmount = useMemo(() => {
    const duration = parseInt(rentalDurationHours, 10);
    if (isNaN(duration) || duration <= 0 || isNaN(parsedPricePerHour) || isNaN(parsedPricePerDay)) {
      return 0;
    }
    // Simple hourly vs daily logic (backend should have the final say)
    if (duration <= 8 && duration * parsedPricePerHour < parsedPricePerDay) { // Example: hourly up to 8 hours or if cheaper than 1 day
      return duration * parsedPricePerHour;
    } else {
      const days = Math.ceil(duration / 24); 
      return days * parsedPricePerDay;
    }
  }, [rentalDurationHours, parsedPricePerHour, parsedPricePerDay]);

  useEffect(() => {
    dispatch(clearBookingError()); // Clear previous errors on mount
    if (!bikeId || isNaN(parsedPricePerHour) || isNaN(parsedPricePerDay)) {
      Alert.alert("Error", "Bike information is missing or invalid. Please go back and select a bike again.", 
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
    // Re-fetch user profile to ensure latest idProofApproved status
    if (authUser?.id) {
        dispatch(fetchUserProfile());
    }
  }, [dispatch, bikeId, parsedPricePerHour, parsedPricePerDay, authUser?.id]);


  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until done
    if (selectedDate) {
      const currentDate = selectedDate || startTime;
      // Prevent selecting past dates/times
      if (currentDate < new Date()) {
        Alert.alert("Invalid Date", "Please select a future date and time.");
        setStartTime(new Date(Date.now() + 60 * 60 * 1000)); // Reset to 1 hour from now
        return;
      }
      setStartTime(currentDate);
      if (Platform.OS !== 'ios') { // For Android, immediately open time picker
          setShowTimePicker(true);
      }
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const currentTime = selectedTime || startTime;
      const updatedStartTime = new Date(startTime); // Keep the date part
      updatedStartTime.setHours(currentTime.getHours());
      updatedStartTime.setMinutes(currentTime.getMinutes());

      if (updatedStartTime < new Date()) {
        Alert.alert("Invalid Time", "Please select a future time.");
         setStartTime(new Date(Date.now() + 60 * 60 * 1000)); // Reset
        return;
      }
      setStartTime(updatedStartTime);
    }
  };


  const handleConfirmAndPay = async () => {
    if (!authUser) {
      Alert.alert("Not Logged In", "You need to be logged in to make a booking.", [{text: "OK", onPress: () => router.replace("/(auth)/login")}]);
      return;
    }
    if (!authUser.idProofApproved) {
      Alert.alert("ID Not Approved", "Your ID documents must be approved before booking.",
        [{ text: "Upload Documents", onPress: () => router.push('/(app)/(user)/upload-documents' as any) }, { text: "OK" }]
      );
      return;
    }

    const duration = parseInt(rentalDurationHours, 10);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert("Invalid Duration", "Please enter a valid rental duration in hours.");
      return;
    }
    if (startTime <= new Date()) {
        Alert.alert("Invalid Start Time", "Booking start time must be in the future.");
        return;
    }

    if (!bikeId) { // Should be caught by useEffect, but good to double check
        Alert.alert("Error", "Bike ID is missing.");
        return;
    }

    const bookingPayload = {
      userId: authUser.id,
      bikeId: bikeId,
      startTime: startTime.toISOString(), // Send as ISO string
      rentalDurationHours: duration,
      // totalAmount will be recalculated and confirmed by backend
    };

    const resultAction = await dispatch(createBookingThunk(bookingPayload));

    if (createBookingThunk.fulfilled.match(resultAction)) {
      const { booking, order } = resultAction.payload; // This is CreateBookingApiResponse
      console.log('Booking created, Razorpay Order ID:', order.id, 'Booking ID:', booking.id);
      // Navigate to Payment Screen with Razorpay order_id and our booking_id
      router.push({
        pathname: '/(app)/(user)/payment-screen' , // We will create this screen next
        params: { 
            razorpayOrderId: order.id, 
            bookingId: booking.id,
            amount: order.amount, // Amount in paise
            currency: order.currency,
            userName: authUser.fullName,
            userEmail: authUser.email,
            userPhone: authUser.phone
        },
      });
    } else {
      Alert.alert("Booking Failed", resultAction.payload as string || "Could not initiate booking. Please try again.");
    }
  };


  if (!bikeId || isNaN(parsedPricePerHour) || isNaN(parsedPricePerDay)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Invalid bike details. Please go back.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Confirm Your Booking</Text>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Bike Details</Text>
        <Text style={styles.infoText}>Bike ID: {bikeId}</Text>
        <Text style={styles.infoText}>Price: ₹{parsedPricePerHour.toFixed(2)}/hr  |  ₹{parsedPricePerDay.toFixed(2)}/day</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Rental Details</Text>
        <View style={styles.inputRow}>
            <CalendarDays size={20} color={Colors.light.textMuted} style={styles.icon} />
            <Text style={styles.label}>Start Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{startTime.toLocaleDateString()}</Text>
            </TouchableOpacity>
        </View>
        {showDatePicker && (
            <DateTimePicker
            testID="datePicker"
            value={startTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()} // Prevent past dates
            />
        )}
        <View style={styles.inputRow}>
            <Clock size={20} color={Colors.light.textMuted} style={styles.icon} />
            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dateText}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
        </View>
        {showTimePicker && (
            <DateTimePicker
            testID="timePicker"
            value={startTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
            // minimumDate might not work well for time alone, handled in logic
            />
        )}

        <Text style={styles.label}>Duration (in hours):</Text>
        <TextInput
            style={styles.input}
            value={rentalDurationHours}
            onChangeText={setRentalDurationHours}
            keyboardType="numeric"
            placeholder="e.g., 2"
        />
        <Text style={styles.infoTextSmall}>Note: For durations over 8 hours, daily rates may apply.</Text>
      </View>
      
      <View style={styles.summarySection}>
        <Text style={styles.summaryLabel}>Estimated Total:</Text>
        <Text style={styles.summaryAmount}>₹{totalAmount.toFixed(2)}</Text>
      </View>

      {bookingError && <Text style={styles.errorText}>{bookingError}</Text>}

      <Button
        title={isCreatingBooking ? "Processing..." : "Confirm & Proceed to Payment"}
        onPress={handleConfirmAndPay}
        disabled={isCreatingBooking || !authUser?.idProofApproved}
      />
      {!authUser?.idProofApproved && 
        <View style={styles.warningBox}>
            <Info size={18} color="orange" />
            <Text style={styles.warningText}> Your ID proof must be approved to complete booking.</Text>
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: Colors.light.tint,
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.light.text,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.light.textMuted,
  },
  infoTextSmall: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 10,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.divider,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 5,
    backgroundColor: 'white',
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
    paddingVertical: 20,
    paddingHorizontal:15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.divider,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  warningBox: {
    marginTop:10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0', // Light orange
    padding: 10,
    borderRadius: 5,
  },
  warningText: {
    color: '#e65100', // Darker orange
    fontSize: 13,
    marginLeft: 5,
  }
});
