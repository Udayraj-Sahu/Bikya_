// app/(app)/(user)/explore.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAvailableBikesThunk, clearBikeError } from '@/redux/slices/bikeSlice';
import BikeCard from '@/components/BikeCard'; 
import { Bike } from '@/types';
import Colors from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import { MapPin, Search as SearchIcon, Filter } from 'lucide-react-native';
import { useLocation } from '@/hooks/useLocation'; // Your custom hook

export default function ExploreScreen() {
  const dispatch = useAppDispatch();
  const { bikes, isLoading, error } = useAppSelector((state) => state.bike);
  
  const { 
    location, // This is typed as { latitude: number; longitude: number; } | null
    errorMsg: locationError, 
    loading: locationLoading, 
    requestLocationPermission
  } = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  // ... other state ...

  const loadBikes = useCallback((isRefreshing = false) => {
    dispatch(clearBikeError());
    let locationParams;
    // CORRECT USAGE: Access latitude and longitude directly from the 'location' object
    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      locationParams = {
        latitude: location.latitude,
        longitude: location.longitude,
        maxDistance: 20000, 
      };
    }
    dispatch(fetchAvailableBikesThunk(locationParams));
  }, [dispatch, location]); // 'location' from useLocation() is a dependency

  useEffect(() => {
    requestLocationPermission(); 
  }, [requestLocationPermission]);

  useFocusEffect( 
    useCallback(() => {
      loadBikes();
      return () => {};
    }, [loadBikes])
  );

  // ... rest of your component (handleBikePress, renderBikeItem, UI) ...
  // Ensure no other part of this file tries to do location.coords

  // (The UI and styles part of the component would be here as previously provided)
  // For brevity, I'm omitting the full UI code again, assuming it doesn't misuse 'location'.
  // The key is the 'loadBikes' function above.

  // --- Start of UI (ensure no location.coords here) ---
  const handleBikePress = (bikeId: string) => {
    router.push({ pathname: '/(app)/(user)/bike-details', params: { bikeId } });
  };

  const renderBikeItem = ({ item }: { item: Bike }) => (
    <BikeCard bike={item} onPress={() => handleBikePress(item.id)} />
  );

  const onRefresh = () => {
    loadBikes(true);
  };

  const filteredBikes = bikes.filter(bike => 
    bike.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bike.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bike.location.address && bike.location.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Bikes</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={Colors.light.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by model, category, or location..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Colors.light.textMuted}
        />
      </View>

      {locationLoading && <Text style={styles.infoText}>Fetching your location...</Text>}
      {locationError && <Text style={styles.errorText}>Location Error: {locationError}. Showing all bikes.</Text>}
      
      {isLoading && bikes.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.infoText}>Finding nearby bikes...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Retry" onPress={() => loadBikes()} />
        </View>
      ) : filteredBikes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noBikesText}>No bikes available matching your criteria.</Text>
          {searchTerm !== '' && <Button title="Clear Search" onPress={() => setSearchTerm('')} />}
        </View>
      ) : (
        <FlatList
          data={filteredBikes}
          renderItem={renderBikeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          numColumns={2} 
          columnWrapperStyle={styles.row}
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
    backgroundColor: Colors.light.background || '#fff', 
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
    paddingBottom: 10,
    backgroundColor: Colors.light.cardBackground || '#f8f8f8', 
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider || '#eee', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.tint || '#007AFF', 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground || '#f8f8f8',
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.light.divider || '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: Colors.light.text || '#000', 
  },
  listContentContainer: {
    paddingHorizontal: 5, 
    paddingBottom: 20,
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  infoText: {
    textAlign: 'center',
    color: Colors.light.textMuted || '#777', 
    marginTop: 10,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    margin: 10,
  },
  noBikesText: {
    fontSize: 16,
    color: Colors.light.textMuted || '#777',
    textAlign: 'center',
  }
});

const Button = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ marginTop: 10, padding: 10, backgroundColor: Colors.light.primary || '#007AFF', borderRadius: 5 }}>
    <Text style={{ color: 'white', textAlign: 'center' }}>{title}</Text>
  </TouchableOpacity>
);
