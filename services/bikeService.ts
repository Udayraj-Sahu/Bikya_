import { Bike } from '@/types';

// Mock data
const mockBikes: Bike[] = [
  {
    id: '1',
    model: 'Mountain Explorer X1',
    pricePerHour: 10,
    pricePerDay: 50,
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Jayanagar, Bangalore',
    },
    available: true,
    images: [
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg',
      'https://images.pexels.com/photos/2393835/pexels-photo-2393835.jpeg',
    ],
    category: 'Mountain',
    createdBy: '2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    model: 'City Cruiser C200',
    pricePerHour: 8,
    pricePerDay: 40,
    location: {
      latitude: 12.9352,
      longitude: 77.6245,
      address: 'Koramangala, Bangalore',
    },
    available: true,
    images: [
      'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg',
      'https://images.pexels.com/photos/5465/bike-bicycle-shadow-water.jpg',
    ],
    category: 'Cruiser',
    createdBy: '2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    model: 'Road Racer R5',
    pricePerHour: 15,
    pricePerDay: 70,
    location: {
      latitude: 12.9767,
      longitude: 77.5713,
      address: 'Basavanagudi, Bangalore',
    },
    available: true,
    images: [
      'https://images.pexels.com/photos/2909106/pexels-photo-2909106.jpeg',
      'https://images.pexels.com/photos/544997/pexels-photo-544997.jpeg',
    ],
    category: 'Road',
    createdBy: '2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    model: 'Electric Glide E1',
    pricePerHour: 20,
    pricePerDay: 90,
    location: {
      latitude: 12.9553,
      longitude: 77.6426,
      address: 'Indiranagar, Bangalore',
    },
    available: true,
    images: [
      'https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg',
      'https://images.pexels.com/photos/5465/bike-bicycle-shadow-water.jpg',
    ],
    category: 'Electric',
    createdBy: '2',
    createdAt: new Date().toISOString(),
  },
];

// Get all bikes
export const getBikes = async (): Promise<Bike[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBikes);
    }, 500);
  });
};

// Get bikes by location
export const getBikesByLocation = async (latitude: number, longitude: number): Promise<Bike[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would filter bikes based on proximity to provided coordinates
      // For now, just return all bikes with a random order
      const shuffled = [...mockBikes].sort(() => 0.5 - Math.random());
      resolve(shuffled);
    }, 500);
  });
};

// Get bike by ID
export const getBikeById = async (id: string): Promise<Bike> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bike = mockBikes.find(b => b.id === id);
      if (bike) {
        resolve(bike);
      } else {
        reject(new Error('Bike not found'));
      }
    }, 500);
  });
};

// Add new bike
export const addBike = async (bike: Omit<Bike, 'id' | 'createdAt'>): Promise<Bike> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBike: Bike = {
        ...bike,
        id: (mockBikes.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };
      mockBikes.push(newBike);
      resolve(newBike);
    }, 500);
  });
};

// Update bike
export const updateBike = async (id: string, updates: Partial<Bike>): Promise<Bike> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockBikes.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBikes[index] = { ...mockBikes[index], ...updates };
        resolve(mockBikes[index]);
      } else {
        reject(new Error('Bike not found'));
      }
    }, 500);
  });
};

// Delete bike
export const deleteBike = async (id: string): Promise<void> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockBikes.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBikes.splice(index, 1);
        resolve();
      } else {
        reject(new Error('Bike not found'));
      }
    }, 500);
  });
};