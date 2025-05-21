import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchBikes, setSelectedBike } from '@/redux/slices/bikeSlice';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Search, Sliders, MapPin } from 'lucide-react-native';
import BikeCard from '@/components/BikeCard';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const dispatch = useAppDispatch();
  const { bikes, isLoading } = useAppSelector(state => state.bikes);
  const { user } = useAppSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  useEffect(() => {
    dispatch(fetchBikes());
  }, [dispatch]);
  
  const handleBikePress = (bike) => {
    dispatch(setSelectedBike(bike));
    router.push('/(app)/(user)/bike-details');
  };
  
  const filteredBikes = searchQuery
    ? bikes.filter(bike => 
        bike.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bike.location.address && bike.location.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : bikes;
  
  const categories = ['All', 'Mountain', 'Road', 'Cruiser', 'Electric'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categoryFilteredBikes = selectedCategory === 'All' 
    ? filteredBikes 
    : filteredBikes.filter(bike => bike.category === selectedCategory);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Bikes</Text>
        {user?.location && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.light.primary} />
            <Text style={styles.locationText}>Bengaluru, Karnataka</Text>
          </View>
        )}
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.grey4} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by model, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.grey4}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Sliders size={20} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      
      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]} 
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'map' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.viewModeText, viewMode === 'map' && styles.viewModeTextActive]}>Map</Text>
        </TouchableOpacity>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === item && styles.categoryItemSelected
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextSelected
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      {viewMode === 'list' ? (
        <FlatList
          data={categoryFilteredBikes}
          renderItem={({ item }) => (
            <BikeCard bike={item} onPress={handleBikePress} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bikesList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.bikeColumns}
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: user?.location?.latitude || 12.9716,
              longitude: user?.location?.longitude || 77.5946,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {categoryFilteredBikes.map(bike => (
              <Marker
                key={bike.id}
                coordinate={{
                  latitude: bike.location.latitude,
                  longitude: bike.location.longitude,
                }}
                title={bike.model}
                description={`₹${bike.pricePerHour}/hour`}
                pinColor={bike.available ? Colors.light.tertiary : Colors.light.danger}
                onPress={() => handleBikePress(bike)}
              />
            ))}
          </MapView>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.divider,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.divider,
    borderRadius: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewModeButtonActive: {
    borderBottomColor: Colors.light.primary,
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.grey3,
  },
  viewModeTextActive: {
    color: Colors.light.primary,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
    marginBottom: 8,
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
  bikesList: {
    padding: 8,
  },
  bikeColumns: {
    justifyContent: 'space-between',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});