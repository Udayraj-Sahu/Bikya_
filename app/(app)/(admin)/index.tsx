import { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchBikes } from '@/redux/slices/bikeSlice';
import { fetchAllBookings } from '@/redux/slices/bookingSlice';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Bike, Calendar, DollarSign, Clock } from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { bikes } = useAppSelector(state => state.bikes);
  const { bookings } = useAppSelector(state => state.bookings);
  
  useEffect(() => {
    dispatch(fetchBikes());
    dispatch(fetchAllBookings());
  }, [dispatch]);
  
  // Calculate active bookings
  const activeBookings = bookings.filter(booking => booking.status === 'active');
  
  // Calculate revenue
  const totalRevenue = bookings.reduce((total, booking) => total + booking.totalAmount, 0);
  
  // Calculate available bikes
  const availableBikes = bikes.filter(bike => bike.available);
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.fullName.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>Here's your admin dashboard</Text>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.tertiary}10` }]}
            onPress={() => router.push('/(app)/(admin)/inventory')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.tertiary }]}>
              <Bike size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{bikes.length}</Text>
            <Text style={styles.statLabel}>Total Bikes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.secondary}10` }]}
            onPress={() => router.push('/(app)/(admin)/bookings')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.secondary }]}>
              <Calendar size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.primary}10` }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary }]}>
              <DollarSign size={20} color="white" />
            </View>
            <Text style={styles.statValue}>₹{totalRevenue}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: `${Colors.light.success}10` }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.success }]}>
              <Clock size={20} color="white" />
            </View>
            <Text style={styles.statValue}>{activeBookings.length}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/(admin)/inventory/add-bike')}
            >
              <Text style={styles.actionButtonText}>Add New Bike</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/(admin)/bookings')}
            >
              <Text style={styles.actionButtonText}>View Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Inventory Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inventory Summary</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(admin)/inventory')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inventorySummaryContainer}>
            <View style={styles.inventorySummaryItem}>
              <Text style={styles.inventorySummaryValue}>{availableBikes.length}</Text>
              <Text style={styles.inventorySummaryLabel}>Available</Text>
            </View>
            <View style={styles.inventorySummaryItem}>
              <Text style={styles.inventorySummaryValue}>{bikes.length - availableBikes.length}</Text>
              <Text style={styles.inventorySummaryLabel}>In Use</Text>
            </View>
            <View style={styles.inventorySummaryItem}>
              <Text style={styles.inventorySummaryValue}>{bikes.length}</Text>
              <Text style={styles.inventorySummaryLabel}>Total</Text>
            </View>
          </View>
        </View>
        
        {/* Booking Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booking Statistics</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(admin)/bookings')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bookingStatsContainer}>
            <View style={styles.bookingStatsItem}>
              <View style={[styles.statusDot, { backgroundColor: Colors.light.success }]} />
              <Text style={styles.bookingStatsLabel}>Active</Text>
              <Text style={styles.bookingStatsValue}>
                {bookings.filter(b => b.status === 'active').length}
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
              <Text style={styles.bookingStatsLabel}>Cancelled</Text>
              <Text style={styles.bookingStatsValue}>
                {bookings.filter(b => b.status === 'cancelled').length}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.grey3,
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
    fontSize: 14,
    color: Colors.light.grey3,
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
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
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
    justifyContent: 'space-between',
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
    color: Colors.light.grey3,
  },
  bookingStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingStatsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  bookingStatsLabel: {
    fontSize: 14,
    color: Colors.light.grey3,
    marginRight: 8,
  },
  bookingStatsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});