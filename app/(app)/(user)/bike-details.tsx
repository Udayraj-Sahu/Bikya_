// app/(app)/(user)/bike-details.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchBikeDetailsThunk, setSelectedBike, clearBikeError } from '@/redux/slices/bikeSlice';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { MapPin, CalendarDays, CheckCircle, XCircle, Tag, DollarSign, Info } from 'lucide-react-native';
// For image carousel/slider, you might use a library or a simple ScrollView
// import Swiper from 'react-native-swiper'; // Example library

const { width: screenWidth } = Dimensions.get('window');

export default function BikeDetailsScreen() {
  const dispatch = useAppDispatch();
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  const { selectedBike, isLoading, error } = useAppSelector((state) => state.bike);
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (bikeId) {
      dispatch(clearBikeError());
      dispatch(fetchBikeDetailsThunk(bikeId));
    }
    // Clear selected bike when screen is left (optional, depends on desired UX)
    return () => {
      // dispatch(setSelectedBike(null)); // Or keep it for quicker back navigation
    };
  }, [dispatch, bikeId]);

  const handleBookNow = () => {
    if (!authUser) {
      Alert.alert("Authentication Required", "Please log in to book a bike.", [
        { text: "OK", onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    if (authUser.role !== 'user') {
        Alert.alert("Access Denied", "Only users can book bikes.");
        return;
    }

    if (!authUser.idProofApproved) {
      Alert.alert(
        "ID Verification Required",
        "Your ID documents must be approved before you can book a bike. Please upload your documents or wait for approval.",
        [
          { text: "Upload Documents", onPress: () => router.push('/(app)/(user)/upload-documents' as any) },
          { text: "OK", style: "cancel" }
        ]
      );
      return;
    }

    if (selectedBike && !selectedBike.availability) {
        Alert.alert("Not Available", "This bike is currently not available for booking.");
        return;
    }

    // Navigate to booking creation screen, passing bike details
    if (selectedBike) {
      router.push({
        pathname: '/(app)/(user)/create-booking', // We will create this screen next
        params: { bikeId: selectedBike.id, pricePerHour: selectedBike.pricePerHour, pricePerDay: selectedBike.pricePerDay },
      });
    }
  };

  if (isLoading || !selectedBike && !error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.infoText}>Loading bike details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!selectedBike) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.infoText}>Bike not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel/Slider */}
      <View style={styles.imageSliderContainer}>
        {selectedBike.images && selectedBike.images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {selectedBike.images.map((imgUrl, index) => (
              <Image key={index} source={{ uri: imgUrl }} style={styles.bikeImage} onError={() => console.log(`Failed to load image: ${imgUrl}`)} />
            ))}
          </ScrollView>
        ) : (
          <Image source={{ uri: 'https://placehold.co/600x400/eee/ccc?text=No+Image' }} style={styles.bikeImage} />
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.modelName}>{selectedBike.model}</Text>
        <View style={styles.detailRow}>
          <Tag size={18} color={Colors.light.textMuted} style={styles.icon} />
          <Text style={styles.category}>{selectedBike.category}</Text>
        </View>

        <View style={styles.detailRow}>
          <DollarSign size={18} color={Colors.light.textMuted} style={styles.icon} />
          <Text style={styles.price}>
            ₹{selectedBike.pricePerHour.toFixed(2)}/hr  |  ₹{selectedBike.pricePerDay.toFixed(2)}/day
          </Text>
        </View>

        <View style={styles.detailRow}>
          {selectedBike.availability ? (
            <CheckCircle size={18} color="green" style={styles.icon} />
          ) : (
            <XCircle size={18} color="red" style={styles.icon} />
          )}
          <Text style={selectedBike.availability ? styles.available : styles.unavailable}>
            {selectedBike.availability ? 'Available for booking' : 'Currently Unavailable'}
          </Text>
        </View>

        {selectedBike.location.address && (
          <View style={styles.detailRow}>
            <MapPin size={18} color={Colors.light.textMuted} style={styles.icon} />
            <Text style={styles.locationText}>{selectedBike.location.address}</Text>
          </View>
        )}
         <View style={styles.detailRow}>
            <Info size={18} color={Colors.light.textMuted} style={styles.icon} />
            <Text style={styles.locationText}>
                Approx. Location: {selectedBike.location.latitude.toFixed(4)}, {selectedBike.location.longitude.toFixed(4)}
            </Text>
          </View>

        {/* Placeholder for description - add if your Bike model has it */}
        {/* <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>{selectedBike.description || 'No description available.'}</Text> */}

        <Button
          title={selectedBike.availability ? "Book Now" : "Not Available"}
          onPress={handleBookNow}
          disabled={!selectedBike.availability || !authUser?.idProofApproved}
          style={styles.bookButton}
        />
        {!selectedBike.availability && <Text style={styles.infoTextSmall}>This bike cannot be booked at the moment.</Text>}
        {authUser && !authUser.idProofApproved && selectedBike.availability && <Text style={styles.warningText}>Your ID must be approved to book.</Text>}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageSliderContainer: {
    height: screenWidth * 0.75, // Adjust aspect ratio as needed
    backgroundColor: '#e0e0e0',
  },
  bikeImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
    resizeMode: 'cover', // Or 'contain' if you prefer
  },
  detailsContainer: {
    padding: 20,
  },
  modelName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  category: {
    fontSize: 16,
    color: Colors.light.textMuted,
    fontStyle: 'italic',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  available: {
    fontSize: 16,
    color: 'green',
    fontWeight: '500',
  },
  unavailable: {
    fontSize: 16,
    color: 'red',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 15,
    color: Colors.light.text,
    flexShrink: 1, // Allow text to wrap
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.text,
  },
  bookButton: {
    marginTop: 25,
    backgroundColor: Colors.light.tint,
  },
  infoText: {
    textAlign: 'center',
    color: Colors.light.textMuted,
    marginTop: 10,
  },
  infoTextSmall: {
    textAlign: 'center',
    color: Colors.light.textMuted,
    fontSize: 13,
    marginTop: 5,
  },
  warningText: {
    textAlign: 'center',
    color: 'orange',
    fontSize: 13,
    marginTop: 5,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    margin: 10,
  },
});
