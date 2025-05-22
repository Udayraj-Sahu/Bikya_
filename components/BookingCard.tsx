// frontend/components/BookingCard.tsx
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Booking } from '@/types';
import Colors from '@/constants/Colors';
import { Calendar, Clock } from 'lucide-react-native';

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return 'Invalid Time';
  }
};

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const getStatusColor = () => {
    switch (booking.status) {
      case 'active':
      case 'confirmed':
        return Colors.light.tertiary || '#5bc0de'; // Fallback
      case 'completed':
        return Colors.light.success || '#5cb85c'; // Fallback
      case 'pending_payment':
      case 'pending_approval':
        return Colors.light.warning || '#f0ad4e'; // Fallback
      case 'cancelled':
      case 'rejected':
      case 'payment_failed': // <<< ADDED 'payment_failed' HERE
        return Colors.light.danger || '#d9534f';   // Fallback
      default:
        return Colors.light.grey4 || '#8e8e93'; 
    }
  };

  // Helper to make status display more readable
  const displayStatus = booking.status.replace(/_/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(booking)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={Colors.light.grey4 || '#8e8e93'} />
          <Text style={styles.date}>{formatDate(booking.startTime)}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {displayStatus}
          </Text>
        </View>
      </View>

      <View style={styles.bikeContainer}>
        {booking.bike?.images && booking.bike.images.length > 0 ? (
          <Image source={{ uri: booking.bike.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.bikeDetails}>
          <Text style={styles.bikeModel} numberOfLines={1}>
            {booking.bike?.model || 'Bike Information Unavailable'}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={Colors.light.grey4 || '#8e8e93'} />
            <Text style={styles.timeText}>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amount}>₹{booking.totalAmount?.toFixed(2) || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: Colors.light.grey3 || '#c7c7cc', 
    marginLeft: 4,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bikeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.light.divider || '#e0e0e0', 
  },
  bikeDetails: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  bikeModel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.grey3 || '#c7c7cc',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider || '#e0e0e0',
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.light.grey4 || '#8e8e93',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});
