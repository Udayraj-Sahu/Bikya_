// frontend/types/index.ts

// --- Other type definitions (User, Document, Bike, etc.) ---
// Ensure they are complete as per previous discussions

export interface Bike { // Example, ensure your Bike type is complete
  id: string;
  model: string;
  category: string;
  pricePerHour: number;
  pricePerDay: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  availability: boolean;
  images: string[];
  createdBy?: string;
  createdAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  bikeId: string;
  bike?: Bike; // Populated bike details
  startTime: string; // ISO Date string
  endTime: string;   // ISO Date string
  rentalDuration?: {
    units: number;
    type: 'hours' | 'days';
  };
  totalAmount: number;
  securityDeposit?: number;
  // Updated status to include 'payment_failed'
  status: 'pending_payment' | 'pending_approval' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected' | 'payment_failed';
  orderId?: string; // Razorpay Order ID from backend
  paymentId?: string; // Razorpay Payment ID after successful payment
  paymentStatus?: 'pending' | 'success' | 'failed'; // This is different from booking status
  createdAt: string;
  review?: { rating: number; comment?: string; createdAt: string };
  cancelReason?: string; // If you added this on backend
}

// For Razorpay order object within CreateBookingApiResponse
export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt?: string;
    offer_id?: string | null;
    status: string; // e.g., 'created', 'attempted', 'paid'
    attempts?: number;
    notes?: any;
    created_at?: number;
}

export interface CreateBookingApiResponse {
  booking: Booking; // Your DB booking object
  order: RazorpayOrder; // The Razorpay order object
}

export type DocumentApprovalStatus = 'pending' | 'approved' | 'rejected' | null;

// --- Ensure User, AuthState, etc. are also correctly defined ---
export type UserRole = 'user' | 'admin' | 'owner';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  walletBalance?: number;
  idProofSubmitted?: boolean;
  idProofApproved?: boolean;
  documents?: Document[]; // Assuming Document type is defined
}
export interface Document {
  id: string;
  userId: string;
  documentType: 'idCard' | 'drivingLicense';
  frontImageUri?: string;
  backImageUri?: string;
  status: DocumentApprovalStatus; // Use the defined type
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}


export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  documentStatus: DocumentApprovalStatus;
}
