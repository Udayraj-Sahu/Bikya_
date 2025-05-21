import { Booking, Bike } from '@/types';
import { getBikeById } from './bikeService';

// Mock data
const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '1',
    bikeId: '1',
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    duration: 2, // 2 hours
    totalAmount: 20,
    status: 'active',
    paymentId: 'pay_123456',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    bikeId: '2',
    startTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    endTime: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    duration: 12, // 12 hours
    totalAmount: 48,
    status: 'completed',
    paymentId: 'pay_123457',
    createdAt: new Date(Date.now() - 90000000).toISOString(),
  },
];

// Get all bookings
export const getAllBookings = async (): Promise<Booking[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Fetch bike details for each booking
      const bookingsWithBikes = await Promise.all(
        mockBookings.map(async (booking) => {
          try {
            const bike = await getBikeById(booking.bikeId);
            return { ...booking, bike };
          } catch (error) {
            return booking;
          }
        })
      );
      resolve(bookingsWithBikes);
    }, 500);
  });
};

// Get bookings by user ID
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(async () => {
      const userBookings = mockBookings.filter(booking => booking.userId === userId);
      
      // Fetch bike details for each booking
      const bookingsWithBikes = await Promise.all(
        userBookings.map(async (booking) => {
          try {
            const bike = await getBikeById(booking.bikeId);
            return { ...booking, bike };
          } catch (error) {
            return booking;
          }
        })
      );
      resolve(bookingsWithBikes);
    }, 500);
  });
};

// Create new booking
export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
  // Simulate API call
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const newBooking: Booking = {
        ...booking,
        id: (mockBookings.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };
      
      mockBookings.push(newBooking);
      
      // Add bike details
      try {
        const bike = await getBikeById(booking.bikeId);
        resolve({ ...newBooking, bike });
      } catch (error) {
        resolve(newBooking);
      }
    }, 500);
  });
};

// Update booking status
export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<Booking> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const index = mockBookings.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBookings[index] = { ...mockBookings[index], status };
        
        // Add bike details
        try {
          const bike = await getBikeById(mockBookings[index].bikeId);
          resolve({ ...mockBookings[index], bike });
        } catch (error) {
          resolve(mockBookings[index]);
        }
      } else {
        reject(new Error('Booking not found'));
      }
    }, 500);
  });
};