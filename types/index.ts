export type UserRole = "user" | "admin" | "owner";

// Updated User interface
export interface User {
	id: string; // or _id from MongoDB
	fullName: string;
	email: string;
	phone: string;
	role: UserRole;
	createdAt?: string; // Make optional if not always present or needed on frontend
	location?: {
		// This matches your current frontend usage
		latitude: number;
		longitude: number;
		// Backend model uses type: 'Point' and coordinates: [lng, lat]
		// Ensure your backend transforms this to latitude/longitude before sending,
		// or adjust this type and frontend logic accordingly.
	};
	// New fields from backend user model
	walletBalance?: number;
	idProofSubmitted?: boolean;
	idProofApproved?: boolean;
	// If you plan to populate documents or bookings directly onto the user object from backend:
	// documents?: Document[];
	// bookings?: Booking[];
}

export interface Document {
	id: string;
	userId: string;
	documentType: "idCard" | "drivingLicense";
	frontImageUri?: string; // URI from Cloudinary
	backImageUri?: string; // URI from Cloudinary
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	reviewedAt?: string;
	reviewedBy?: string; // User ID of owner
	// user?: User; // If populated
}

export interface Bike {
	id: string;
	model: string;
	category: string;
	pricePerHour: number;
	pricePerDay: number;
	location: {
		// Frontend expects latitude, longitude
		latitude: number;
		longitude: number;
		address?: string; // Human-readable address
		// Backend model uses type: 'Point' and coordinates: [lng, lat]
		// Ensure transformation if needed.
	};
	availability: boolean; // Renamed from 'available' for consistency
	images: string[]; // Array of image URLs
	createdBy?: string; // Optional on frontend if not always needed
	createdAt?: string;
}

export interface Booking {
	id: string;
	userId: string;
	bikeId: string;
	bike?: Bike; // Populated bike details
	startTime: string; // ISO Date string
	endTime: string; // ISO Date string
	rentalDuration?: {
		// More descriptive than just 'duration: number'
		units: number;
		type: "hours" | "days";
	};
	totalAmount: number;
	securityDeposit?: number; // Added
	status:
		| "pending_payment"
		| "pending_approval"
		| "confirmed"
		| "active"
		| "completed"
		| "cancelled"
		| "rejected"; // Expanded statuses
	paymentId?: string;
	orderId?: string; // Razorpay Order ID
	paymentStatus?: "pending" | "success" | "failed"; // Added
	createdAt: string;
}

// Document Status type (can be reused)
export type DocumentApprovalStatus = "pending" | "approved" | "rejected" | null;

// Corrected AuthState interface
export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean; // Corrected typo here
	isLoading: boolean;
	error: string | null;
	documentStatus: DocumentApprovalStatus; // Using the defined type
}

// For Redux store typings (if not already defined elsewhere like store.ts or hooks.ts)
// import { store } from '@/redux/store';
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
