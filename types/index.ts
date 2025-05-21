export type UserRole = 'user' | 'admin' | 'owner';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Document {
  id: string;
  userId: string;
  uri: string;
  type: 'idCard' | 'drivingLicense';
  side: 'front' | 'back';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Bike {
  id: string;
  model: string;
  pricePerHour: number;
  pricePerDay: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  available: boolean;
  images: string[];
  category: string;
  createdBy: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  bikeId: string;
  bike?: Bike;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentId?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  documentStatus: 'pending' | 'approved' | 'rejected' | null;
}