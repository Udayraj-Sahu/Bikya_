import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Booking } from '@/types';
import Colors from '@/constants/Colors';
import { Calendar, Clock } from 'lucide-react-native';

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const getStatusColor = () => {
    switch (booking.status) {
      case 'active':
        return Colors.light.tertiary;
      case 'completed':
        return Colors.light.success;
      case 'pending':
        return Colors.light.warning;
      case 'cancelled':
        return Colors.light.danger;
      default:
        return Colors.light.grey4;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(booking)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={Colors.light.grey4} />
          <Text style={styles.date}>{formatDate(booking.startTime)}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
            {booking.bike?.model || 'Bike'}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={Colors.light.grey4} />
            <Text style={styles.timeText}>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amount}>₹{booking.totalAmount}</Text>
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
    color: Colors.light.grey3,
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
    backgroundColor: Colors.light.divider,
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
    color: Colors.light.grey3,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.light.grey4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});