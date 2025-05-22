// app/(app)/(admin)/index.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native'; // Added Alert
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllBikesForAdminThunk, clearBikeError } from '@/redux/slices/bikeSlice';
import { fetchAllBookingsThunk, clearBookingError as clearBookingErr } from '@/redux/slices/bookingSlice';
import { logout } from '@/redux/slices/authSlice'; // <<< Import the logout action
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Bike as BikeIconLucide, Calendar, DollarSign, Clock, LogOut } from 'lucide-react-native'; // Added LogOut icon
import Button from '@/components/Button';

export default function AdminDashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { 
    allBikesAdmin, 
    isLoading: bikesLoading, 
    error: bikesError 
  } = useAppSelector(state => state.bike);
  const { 
    bookings, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useAppSelector(state => state.bookings);
  
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'owner') {
        dispatch(clearBikeError());
        dispatch(clearBookingErr());
        dispatch(fetchAllBikesForAdminThunk()); 
        dispatch(fetchAllBookingsThunk());
    }
  }, [dispatch, user?.role]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            dispatch(logout());
            router.replace('/(auth)/login'); // Navigate to login screen
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const activeBookings = bookings.filter(
    booking => booking.status === 'active' || booking.status === 'confirmed'
  );
  const totalRevenue = bookings
    .filter(booking => booking.status === 'completed')
    .reduce((total, booking) => total + booking.totalAmount, 0);
  const availableBikes = allBikesAdmin.filter(bike => bike.availability);
  const isLoading = bikesLoading || bookingsLoading;

  if (isLoading && allBikesAdmin.length === 0 && bookings.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text>Loading Dashboard Data...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Here's your admin dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={Colors.light.background} />
          </TouchableOpacity>
        </View>
        
        {(bikesError || bookingsError) && (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    {bikesError && `Bikes Data Error: ${bikesError}`}
                    {bikesError && bookingsError && "\n"}
                    {bookingsError && `Bookings Data Error: ${bookingsError}`}
                </Text>
                <Button title="Retry Data Load" onPress={() => {
                     if (user?.role === 'admin' || user?.role === 'owner') {
                        dispatch(fetchAllBikesForAdminThunk());
                        dispatch(fetchAllBookingsThunk());
                    }
                }} />
            </View>
        )}
        
        {/* Stats Cards (as before) */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.tertiary}20` }]}
            onPress={() => router.push('/(app)/(admin)/inventory')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.tertiary }]}>
              <BikeIconLucide size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{allBikesAdmin.length}</Text>
            <Text style={styles.statLabel}>Total Bikes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.secondary}20` }]}
            onPress={() => router.push('/(app)/(admin)/bookings')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.secondary }]}>
              <Calendar size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.primary}20` }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary }]}>
              <DollarSign size={20} color="white" />
            </View>
            <Text style={styles.statValue}>₹{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.success}20` }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.success }]}>
              <Clock size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{activeBookings.length}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions (as before) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/(admin)/inventory')}
            >
              <Text style={styles.actionButtonText}>Manage Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/(admin)/bookings')}
            >
              <Text style={styles.actionButtonText}>View All Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Inventory Summary (as before) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inventory Summary</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(admin)/inventory')}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inventorySummaryContainer}>
            <View style={styles.inventorySummaryItem}>
              <Text style={styles.inventorySummaryValue}>{availableBikes.length}</Text>
              <Text style={styles.inventorySummaryLabel}>Available</Text>
            </View>
            <View style={styles.inventorySummaryItem}>
              <Text style={styles.inventorySummaryValue}>{allBikesAdmin.length - availableBikes.length}</Text>
              <Text style={styles.inventorySummaryLabel}>In Use / Booked</Text>
            </View>
            <View style={styles.inventorySummaryItem}>
              <Text style={styles.inventorySummaryValue}>{allBikesAdmin.length}</Text>
              <Text style={styles.inventorySummaryLabel}>Total</Text>
            </View>
          </View>
        </View>
        
        {/* Booking Stats (as before) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booking Statistics</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(admin)/bookings')}>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bookingStatsContainer}>
            <View style={styles.bookingStatsItem}>
              <View style={[styles.statusDot, { backgroundColor: Colors.light.success }]} />
              <Text style={styles.bookingStatsLabel}>Active/Confirmed</Text>
              <Text style={styles.bookingStatsValue}>
                {activeBookings.length}
              </Text>
            </View>
            <View style={styles.bookingStatsItem}>
              <View style={[styles.statusDot, { backgroundColor: Colors.light.primary }]} />
              <Text style={styles.bookingStatsLabel}>Completed</Text>
              <Text style={styles.bookingStatsValue}>
                {bookings.filter(b => b.status === 'completed').length}
              </Text>
            </View>
            <View style={styles.bookingStatsItem}>
              <View style={[styles.statusDot, { backgroundColor: Colors.light.danger }]} />
              <Text style={styles.bookingStatsLabel}>Cancelled/Failed</Text>
              <Text style={styles.bookingStatsValue}>
                {bookings.filter(b  => b.status === 'cancelled' || b.status === 'rejected' || b.status === 'payment_failed').length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background || '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 60, 
    paddingBottom: 20, 
    backgroundColor: Colors.light.primary, 
    flexDirection: 'row', // Added for logout button alignment
    justifyContent: 'space-between', // Added
    alignItems: 'center', // Added
  },
  logoutButton: { // Style for the logout button touchable area
    padding: 8,
  },
  greeting: {
    fontSize: 26, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0', 
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    width: '48%', 
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13, 
    color: Colors.light.textMuted || Colors.light.grey3, 
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: Colors.light.tint || Colors.light.primary, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1, 
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  inventorySummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
  },
  inventorySummaryItem: {
    alignItems: 'center',
    flex: 1, 
  },
  inventorySummaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  inventorySummaryLabel: {
    fontSize: 14,
    color: Colors.light.textMuted || Colors.light.grey3,
  },
  bookingStatsContainer: {
  },
  bookingStatsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, 
  },
  statusDot: {
    width: 10, 
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  bookingStatsLabel: {
    fontSize: 14,
    color: Colors.light.textMuted || Colors.light.grey3,
    marginRight: 8,
    flex: 1, 
  },
  bookingStatsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  errorContainer: {
    margin: 16,
    padding: 10,
    backgroundColor: `${Colors.light.danger}20`, 
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.danger,
    marginBottom: 10,
    textAlign: 'center',
  }
});
