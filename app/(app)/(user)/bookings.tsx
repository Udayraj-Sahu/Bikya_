// app/(app)/(user)/bookings.tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserBookingsThunk, clearBookingError, setSelectedBooking } from '@/redux/slices/bookingSlice';
import BookingCard from '@/components/BookingCard'; // Your BookingCard component
import { Booking } from '@/types';
import Colors from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import { ListX } from 'lucide-react-native';

export default function UserBookingsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { bookings, isLoading, error } = useAppSelector((state) => state.bookings); // Assuming 'bookings' is the key for bookingSlice

  const loadUserBookings = useCallback((isRefreshing = false) => {
    if (user?.id) {
      if (!isRefreshing) { // Only clear error if not a pull-to-refresh to avoid UI jump
        dispatch(clearBookingError());
      }
      dispatch(fetchUserBookingsThunk(user.id));
    } else {
      // Handle case where user is not available (should ideally not happen if screen is protected)
      console.warn("User ID not found, cannot fetch bookings.");
    }
  }, [dispatch, user?.id]);

  // Fetch bookings when the screen comes into focus or user changes
  useFocusEffect(
    useCallback(() => {
      loadUserBookings();
      return () => {
        // Optional: Clear selected booking or other cleanup when screen loses focus
        // dispatch(setSelectedBooking(null));
      };
    }, [loadUserBookings])
  );

  const handleBookingPress = (booking: Booking) => {
    dispatch(setSelectedBooking(booking));
    // Navigate to a booking details screen if you have one, or show modal
    // For now, let's assume we might navigate or just select it.
    // router.push({ pathname: '/(app)/(user)/booking-details', params: { bookingId: booking.id } });
    console.log("Selected booking:", booking.id);
    Alert.alert("Booking Details", `Bike Model: ${booking.bike?.model}\nStatus: ${booking.status}`); // Simple alert for now
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
  );

  const onRefresh = () => {
    loadUserBookings(true);
  };

  if (isLoading && bookings.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.infoText}>Loading your bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ListX size={48} color={Colors.light.danger} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={() => loadUserBookings()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>
      {bookings.length === 0 && !isLoading ? (
        <View style={styles.centered}>
          <ListX size={64} color={Colors.light.textMuted} />
          <Text style={styles.noBookingsText}>You have no bookings yet.</Text>
          <Button title="Explore Bikes" onPress={() => router.push('/(app)/(user)/explore')} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[Colors.light.primary || '#000']} />
          }
        />
      )}
    </View>
  );
}

// Simple Button for Retry/Explore - Replace with your actual Button component if different
const Button = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ marginTop: 20, paddingVertical: 12, paddingHorizontal: 25, backgroundColor: Colors.light.primary || '#007AFF', borderRadius: 8 }}>
    <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>{title}</Text>
  </TouchableOpacity>
);

// Import Alert if not already imported
import { Alert, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background || '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 25 : 15, 
    paddingBottom: 15,
    backgroundColor: Colors.light.cardBackground || '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider || '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.light.tint || '#007AFF',
  },
  listContentContainer: {
    padding: 10,
  },
  infoText: {
    textAlign: 'center',
    color: Colors.light.textMuted || '#777',
    marginTop: 10,
  },
  errorText: {
    textAlign: 'center',
    color: Colors.light.danger || 'red',
    marginVertical: 10,
    fontSize: 16,
  },
  noBookingsText: {
    fontSize: 18,
    color: Colors.light.textMuted || '#777',
    textAlign: 'center',
    marginBottom: 20,
  }
});
