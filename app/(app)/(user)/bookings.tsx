import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserBookings, setSelectedBooking } from '@/redux/slices/bookingSlice';
import Colors from '@/constants/Colors';
import { ClipboardList } from 'lucide-react-native';
import BookingCard from '@/components/BookingCard';

export default function BookingsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { bookings, isLoading } = useAppSelector(state => state.bookings);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserBookings(user.id));
    }
  }, [dispatch, user]);
  
  const handleBookingPress = (booking) => {
    dispatch(setSelectedBooking(booking));
    router.push('/(app)/(user)/booking-details');
  };
  
  const filteredBookings = 
    activeTab === 'all' 
      ? bookings 
      : bookings.filter(booking => booking.status === activeTab);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>Cancelled</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bookings List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text>Loading bookings...</Text>
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={handleBookingPress} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bookingsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <ClipboardList size={64} color={Colors.light.grey4} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No bookings found</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(app)/(user)/explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Bikes</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.grey3,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  bookingsList: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.grey3,
    marginBottom: 16,
  },
  exploreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});