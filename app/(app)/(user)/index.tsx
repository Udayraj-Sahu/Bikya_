import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchBikes, setSelectedBike } from '@/redux/slices/bikeSlice';
import { updateLocation } from '@/redux/slices/authSlice';
import { useLocation } from '@/hooks/useLocation';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Search, MapPin, AlertTriangle } from 'lucide-react-native';
import BikeCard from '@/components/BikeCard';
import Button from '@/components/Button';
import { Bike } from '@/types';

export default function UserHomeScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { bikes, featuredBikes, isLoading } = useAppSelector(state => state.bikes);
  const { location, errorMsg, loading, requestLocationPermission } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (location) {
      dispatch(updateLocation(location));
      dispatch(fetchBikes());
    }
  }, [location, dispatch]);
  
  const handleBikePress = (bike : Bike) => {
    dispatch(setSelectedBike(bike));
    router.push('/(app)/(user)/bike-details');
  };
  
  const categories = ['All', 'Mountain', 'Road', 'Cruiser', 'Electric'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredBikes = selectedCategory === 'All' 
    ? bikes 
    : bikes.filter(bike => bike.category === selectedCategory);
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.fullName.split(' ')[0]}!</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={Colors.light.primary} />
              {location ? (
                <Text style={styles.locationText} numberOfLines={1}>
                  Bengaluru, Karnataka
                </Text>
              ) : (
                <TouchableOpacity onPress={requestLocationPermission}>
                  <Text style={styles.locationPermissionText}>Enable location</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* <View style={styles.notificationBadge}>
            <bikes size={24} color={Colors.light.text} />
          </View> */}
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.grey4} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for bikes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.grey4}
            />
          </View>
        </View>
        
        {/* Location Error */}
        {errorMsg && (
          <View style={styles.errorContainer}>
            <AlertTriangle size={20} color={Colors.light.warning} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Button
              title="Enable Location"
              onPress={requestLocationPermission}
              type="secondary"
            />
          </View>
        )}
        
        {/* Hero Banner */}
        <TouchableOpacity activeOpacity={0.9}>
          <ImageBackground
            source={{ uri: 'https://images.pexels.com/photos/2909106/pexels-photo-2909106.jpeg' }}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
          >
            <View style={styles.heroBannerOverlay} />
            <View style={styles.heroBannerContent}>
              <Text style={styles.heroBannerTitle}>Summer Sale</Text>
              <Text style={styles.heroBannerSubtitle}>Get 20% off on all weekend rentals</Text>
              <Button title="View Offers" onPress={() => {}} type="primary" />
            </View>
          </ImageBackground>
        </TouchableOpacity>
        
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  selectedCategory === category && styles.categoryItemSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Featured Bikes */}
        <View style={styles.featuredContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Bikes</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(user)/explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredBikes}
            renderItem={({ item }) => (
              <BikeCard bike={item} onPress={handleBikePress} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
        
        {/* Nearby Bikes */}
        <View style={styles.nearbyContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Bikes</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(user)/explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {filteredBikes.slice(0, 3).map(bike => (
            <BikeCard key={bike.id} bike={bike} onPress={handleBikePress} />
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.light.grey3,
    marginLeft: 4,
  },
  locationPermissionText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  notificationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.divider,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: `${Colors.light.warning}15`,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 8,
  },
  heroBanner: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroBannerImage: {
    borderRadius: 12,
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
  },
  heroBannerContent: {
    padding: 16,
    justifyContent: 'flex-end',
    height: '100%',
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  heroBannerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 12,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryItemSelected: {
    backgroundColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.grey2,
  },
  categoryTextSelected: {
    color: 'white',
  },
  featuredContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  nearbyContainer: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
});