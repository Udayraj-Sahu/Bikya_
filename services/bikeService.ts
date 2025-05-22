// frontend/services/bikeService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bike, User } from '@/types'; // Assuming Bike and User types are defined

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'; // Ensure this is correct

// Helper to get the token
const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

// --- User-facing functions ---
export const getAllAvailableBikes = async (locationParams?: { latitude: number; longitude: number; maxDistance?: number }): Promise<Bike[]> => {
  let url = `${API_BASE_URL}/bikes`;
  if (locationParams) {
    url += `?coords=${locationParams.longitude},${locationParams.latitude}`; // Backend expects lng,lat
    if (locationParams.maxDistance) {
      url += `&maxDistance=${locationParams.maxDistance}`;
    }
  }
  // Assuming backend response: { data: { bikes: Bike[] } }
  // The Bike[] received here should have location as { latitude, longitude, address? }
  // If backend sends GeoJSON, you'll need to transform it back here or ensure frontend Bike type matches.
  // For now, assuming backend sends location in frontend-friendly format for GET requests.
  const response = await axios.get<{ data: { bikes: Bike[] } }>(url);
  return response.data.data.bikes;
};

export const getBikeDetails = async (bikeId: string): Promise<Bike> => {
  // Assuming backend sends location in frontend-friendly format for GET requests.
  const response = await axios.get<{ data: { bike: Bike } }>(`${API_BASE_URL}/bikes/${bikeId}`);
  return response.data.data.bike;
};


// --- Admin-specific functions ---
export const getAllBikesForAdmin = async (): Promise<Bike[]> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for admin operation');
  // Assuming backend sends location in frontend-friendly format for GET requests.
  const response = await axios.get<{ data: { bikes: Bike[] } }>(`${API_BASE_URL}/bikes?showAll=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.bikes;
};

// Type for the payload sent to the backend for creating/updating bikes
interface BikeApiPayload {
  model: string;
  category: string;
  pricePerHour: number;
  pricePerDay: number;
  images: string[];
  availability?: boolean;
  addressText?: string; // Top-level field for backend
  location: { // GeoJSON for backend
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  // Add other fields from Bike type that are sent directly
}


// Add a new bike
export const addBike = async (bikeData: Omit<Bike, 'id' | 'createdBy' | 'createdAt'>): Promise<Bike> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for admin operation');

  // Construct the payload for the API, transforming location
  const payloadForApi: BikeApiPayload = {
    model: bikeData.model,
    category: bikeData.category,
    pricePerHour: bikeData.pricePerHour,
    pricePerDay: bikeData.pricePerDay,
    images: bikeData.images,
    availability: bikeData.availability, // This is already boolean in Bike type
    addressText: bikeData.location.address, // Extract address
    location: {
      type: 'Point', // GeoJSON type
      coordinates: [bikeData.location.longitude, bikeData.location.latitude], // [lng, lat]
    },
  };

  const response = await axios.post<{ data: { bike: Bike } }>(`${API_BASE_URL}/bikes`, payloadForApi, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // The response 'Bike' should have location in frontend format {latitude, longitude, address}
  // If backend sends GeoJSON in response, transform it here.
  return response.data.data.bike;
};

// Type for the partial payload for updating bikes
interface PartialBikeApiPayload {
  model?: string;
  category?: string;
  pricePerHour?: number;
  pricePerDay?: number;
  images?: string[];
  availability?: boolean;
  addressText?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

// Update an existing bike
export const updateBike = async (bikeId: string, bikeData: Partial<Omit<Bike, 'id' | 'createdBy' | 'createdAt'>>): Promise<Bike> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for admin operation');

  const payloadForApi: PartialBikeApiPayload = {};

  // Map known top-level properties directly
  if (bikeData.model !== undefined) payloadForApi.model = bikeData.model;
  if (bikeData.category !== undefined) payloadForApi.category = bikeData.category;
  if (bikeData.pricePerHour !== undefined) payloadForApi.pricePerHour = bikeData.pricePerHour;
  if (bikeData.pricePerDay !== undefined) payloadForApi.pricePerDay = bikeData.pricePerDay;
  if (bikeData.images !== undefined) payloadForApi.images = bikeData.images;
  if (bikeData.availability !== undefined) payloadForApi.availability = bikeData.availability;

  // Handle location transformation if location data is present in bikeData
  if (bikeData.location) {
    if (bikeData.location.address !== undefined) {
      payloadForApi.addressText = bikeData.location.address;
    }
    if (bikeData.location.longitude !== undefined && bikeData.location.latitude !== undefined) {
      payloadForApi.location = {
        type: 'Point',
        coordinates: [bikeData.location.longitude, bikeData.location.latitude],
      };
    }
  }

  const response = await axios.patch<{ data: { bike: Bike } }>(`${API_BASE_URL}/bikes/${bikeId}`, payloadForApi, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // The response 'Bike' should have location in frontend format {latitude, longitude, address}
  return response.data.data.bike;
};

// Delete a bike
export const deleteBike = async (bikeId: string): Promise<void> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for admin operation');
  await axios.delete(`${API_BASE_URL}/bikes/${bikeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
