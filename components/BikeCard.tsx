import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { Bike } from '@/types';
import Colors from '@/constants/Colors';
import { MapPin, Clock, Star } from 'lucide-react-native';

interface BikeCardProps {
  bike: Bike;
  onPress: (bike: Bike) => void;
  compact?: boolean;
}

const { width } = Dimensions.get('window');

export default function BikeCard({ bike, onPress, compact = false }: BikeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, compact ? styles.compactContainer : {}]}
      onPress={() => onPress(bike)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: bike.images[0] }}
        style={[styles.image, compact ? styles.compactImage : {}]}
      />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.model} numberOfLines={1}>{bike.model}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={Colors.light.warning} fill={Colors.light.warning} />
            <Text style={styles.rating}>4.8</Text>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={Colors.light.grey4} />
          <Text style={styles.locationText} numberOfLines={1}>
            {bike.location.address || 'Location unavailable'}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{bike.pricePerHour}</Text>
            <Text style={styles.perHour}>/hour</Text>
          </View>
          <View style={styles.availabilityContainer}>
            <Clock size={14} color={bike.available ? Colors.light.tertiary : Colors.light.danger} />
            <Text 
              style={[
                styles.availabilityText, 
                { color: bike.available ? Colors.light.tertiary : Colors.light.danger }
              ]}
            >
              {bike.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{bike.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: width - 32,
  },
  compactContainer: {
    width: width / 2 - 24,
    marginHorizontal: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  compactImage: {
    height: 120,
  },
  contentContainer: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.grey4,
    marginLeft: 4,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  perHour: {
    fontSize: 12,
    color: Colors.light.grey4,
    marginBottom: 2,
    marginLeft: 2,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.grey2,
  },
});