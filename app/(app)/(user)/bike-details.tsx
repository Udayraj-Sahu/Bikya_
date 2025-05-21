import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  Alert,
  Platform 
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { createBooking } from '@/redux/slices/bookingSlice';
import Colors from '@/constants/Colors';
import { ArrowLeft, MapPin, Clock, Calendar, ChevronRight } from 'lucide-react-native';
import Button from '@/components/Button';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function BikeDetailsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedBike } = useAppSelector(state => state.bikes);
  const { user, documentStatus } = useAppSelector(state => state.auth);
  const [activeImage, setActiveImage] = useState(0);
  const [hours, setHours] = useState(1);
  
  // Ensure there's a selected bike
  useEffect(() => {
    if (!selectedBike) {
      router.back();
    }
  }, [selectedBike, router]);
  
  if (!selectedBike) {
    return null;
  }
  
  const handleRent = () => {
    if (documentStatus !== 'approved') {
      if (documentStatus === 'pending') {
        Alert.alert(
          'Documents Pending',
          'Your documents are pending approval. You cannot book a bike until your documents are approved.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Documents Required',
          'You need to upload and get your documents approved before booking a bike.',
          [
            { text: 'Cancel' },
            { text: 'Upload Documents', onPress: () => router.push('/(app)/(user)/profile') }
          ]
        );
      }
      return;
    }
    
    // Demo payment success
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
    
    dispatch(createBooking({
      userId: user?.id || '',
      bikeId: selectedBike.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: hours,
      totalAmount: selectedBike.pricePerHour * hours,
      status: 'active',
      paymentId: 'pay_demo' + Math.random().toString(36).substring(2, 11),
    }));
    
    Alert.alert(
      'Booking Successful',
      'Your bike has been booked successfully. You can view your booking details in the Bookings tab.',
      [
        { text: 'View Bookings', onPress: () => router.push('/(app)/(user)/bookings') },
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedBike.images[activeImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <FlatList
            data={selectedBike.images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.thumbnailContainer, activeImage === index && styles.activeThumbnail]}
                onPress={() => setActiveImage(index)}
              >
                <Image source={{ uri: item }} style={styles.thumbnail} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.thumbnailList}
            style={styles.thumbnailScrollView}
          />
        </View>
        
        <View style={styles.detailsContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.bikeModel}>{selectedBike.model}</Text>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{selectedBike.category}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{selectedBike.pricePerHour}</Text>
              <Text style={styles.perHour}>/hour</Text>
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.infoContainer}>
            <MapPin size={18} color={Colors.light.grey3} />
            <Text style={styles.infoText}>{selectedBike.location.address || 'Location unavailable'}</Text>
          </View>
          
          {/* Availability */}
          <View style={styles.availabilityContainer}>
            <View style={[styles.availabilityBadge, { backgroundColor: selectedBike.available ? `${Colors.light.tertiary}20` : `${Colors.light.danger}20` }]}>
              <Text style={[styles.availabilityText, { color: selectedBike.available ? Colors.light.tertiary : Colors.light.danger }]}>
                {selectedBike.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
          
          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedBike.location.latitude,
                longitude: selectedBike.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: selectedBike.location.latitude,
                  longitude: selectedBike.location.longitude,
                }}
                pinColor={Colors.light.primary}
              />
            </MapView>
            <TouchableOpacity style={styles.viewMapButton}>
              <Text style={styles.viewMapText}>View Full Map</Text>
            </TouchableOpacity>
          </View>
          
          {/* Rental Duration */}
          <View style={styles.durationContainer}>
            <Text style={styles.sectionTitle}>Rental Duration</Text>
            <View style={styles.durationSelector}>
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setHours(Math.max(1, hours - 1))}
              >
                <Text style={styles.durationButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.hoursContainer}>
                <Text style={styles.hoursText}>{hours} {hours === 1 ? 'hour' : 'hours'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setHours(hours + 1)}
              >
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.durationInfo}>
              <View style={styles.durationInfoItem}>
                <Clock size={16} color={Colors.light.grey3} />
                <Text style={styles.durationInfoText}>Starts now</Text>
              </View>
              <View style={styles.durationInfoItem}>
                <Calendar size={16} color={Colors.light.grey3} />
                <Text style={styles.durationInfoText}>Ends in {hours} {hours === 1 ? 'hour' : 'hours'}</Text>
              </View>
            </View>
          </View>
          
          {/* Document Status */}
          {documentStatus !== 'approved' && (
            <View style={[
              styles.documentWarning, 
              { backgroundColor: documentStatus === 'pending' ? `${Colors.light.warning}15` : `${Colors.light.danger}15` }
            ]}>
              <Text style={[
                styles.documentWarningText,
                { color: documentStatus === 'pending' ? Colors.light.warning : Colors.light.danger }
              ]}>
                {documentStatus === 'pending' 
                  ? 'Your documents are pending approval' 
                  : documentStatus === 'rejected'
                    ? 'Your documents were rejected. Please upload new documents.'
                    : 'You need to upload your ID documents before booking'}
              </Text>
              <Link href="/(app)/(user)/profile" asChild>
                <TouchableOpacity>
                  <ChevronRight size={20} color={documentStatus === 'pending' ? Colors.light.warning : Colors.light.danger} />
                </TouchableOpacity>
              </Link>
            </View>
          )}
          
          {/* Price Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Price Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemText}>Rental Cost (₹{selectedBike.pricePerHour} x {hours} {hours === 1 ? 'hour' : 'hours'})</Text>
              <Text style={styles.summaryItemValue}>₹{selectedBike.pricePerHour * hours}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemText}>Insurance</Text>
              <Text style={styles.summaryItemValue}>₹0</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemText}>Taxes</Text>
              <Text style={styles.summaryItemValue}>₹0</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalText}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>₹{selectedBike.pricePerHour * hours}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Rent Now Button */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{selectedBike.pricePerHour * hours}</Text>
        </View>
        <Button
          title="Book Now"
          onPress={handleRent}
          disabled={!selectedBike.available}
          fullWidth={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: 'black',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  thumbnailScrollView: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  thumbnailList: {
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: Colors.light.primary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bikeModel: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.grey2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  perHour: {
    fontSize: 14,
    color: Colors.light.grey3,
    marginBottom: 3,
    marginLeft: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.grey3,
    marginLeft: 8,
  },
  availabilityContainer: {
    marginBottom: 16,
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  viewMapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMapText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  durationContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  hoursContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  durationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInfoText: {
    fontSize: 14,
    color: Colors.light.grey3,
    marginLeft: 8,
  },
  documentWarning: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  documentWarningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    marginBottom: 120,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItemText: {
    fontSize: 14,
    color: Colors.light.grey2,
  },
  summaryItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    marginVertical: 12,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: {
    marginRight: 16,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.light.grey3,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
});