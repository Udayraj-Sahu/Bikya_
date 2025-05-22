// app/(app)/(admin)/bookings.tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Platform, Alert, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
    fetchAllBookingsThunk, 
    clearBookingError, 
    setSelectedBooking,
    updateBookingStatusThunk // Import this if admin can change status from here
} from '@/redux/slices/bookingSlice';
import BookingCard from '@/components/BookingCard';
import { Booking } from '@/types';
import Colors from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import { ListX } from 'lucide-react-native';
import Button from '@/components/Button'; // Assuming your Button component

export default function AdminAllBookingsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { bookings, isLoading, error, selectedBooking } = useAppSelector((state) => state.bookings); 

  const loadAdminBookings = useCallback((isRefreshing = false) => {
    if (user?.role === 'admin' || user?.role === 'owner') {
      if (!isRefreshing) {
        dispatch(clearBookingError());
      }
      dispatch(fetchAllBookingsThunk());
    }
  }, [dispatch, user?.role]);

  useFocusEffect(
    useCallback(() => {
      loadAdminBookings();
    }, [loadAdminBookings])
  );

  const handleBookingPress = (booking: Booking) => {
    dispatch(setSelectedBooking(booking));
    // For an admin, you might want to open a modal to update status, or navigate to a detailed view.
    // For now, let's show an alert with options to change status.
    Alert.alert(
      `Booking ID: ${booking.id}`,
      `User: ${booking.userId}\nBike: ${booking.bikeId}\nCurrent Status: ${booking.status}\n\nUpdate status?`,
      [
        { text: "Cancel", style: "cancel" },
        // Example: Allow admin to mark as 'active' or 'completed' or 'cancelled'
        // Ensure these statuses are valid for your updateBookingStatusThunk
        { text: "Mark Active", onPress: () => dispatch(updateBookingStatusThunk({ id: booking.id, status: 'active' })) },
        { text: "Mark Completed", onPress: () => dispatch(updateBookingStatusThunk({ id: booking.id, status: 'completed' })) },
        { text: "Mark Cancelled", onPress: () => dispatch(updateBookingStatusThunk({ id: booking.id, status: 'cancelled' })) },
      ],
      { cancelable: true }
    );
    // Or navigate:
    // router.push({ pathname: '/(app)/(admin)/booking-details', params: { bookingId: booking.id }});
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <BookingCard 
        booking={item} 
        onPress={() => handleBookingPress(item)} // <<< onPress prop is now provided
    />
  );

  const onRefresh = () => {
    loadAdminBookings(true);
  };

  if (isLoading && bookings.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.infoText}>Loading all bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ListX size={48} color={Colors.light.danger} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={() => loadAdminBookings()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Customer Bookings</Text>
      </View>
      {bookings.length === 0 && !isLoading ? (
         <View style={styles.centered}>
            <ListX size={64} color={Colors.light.textMuted} />
            <Text style={styles.noBookingsText}>No bookings found in the system.</Text>
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
    fontSize: 16,
    color: Colors.light.textMuted || '#777',
    textAlign: 'center',
  }
});
