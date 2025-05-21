import { User, UserRole } from '@/types';

// Simulated API responses for development
// In a production app, these would make actual API calls

export const login = async (email: string, password: string) => {
  // Simulate API call
  return new Promise<{ user: User; token: string }>((resolve, reject) => {
    setTimeout(() => {
      // Mock validation - in real app, this would be done on the server
      if (email === 'user@example.com' && password === 'password') {
        resolve({
          user: {
            id: '1',
            fullName: 'John Doe',
            email: 'user@example.com',
            phone: '1234567890',
            role: 'user',
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        });
      } else if (email === 'admin@example.com' && password === 'password') {
        resolve({
          user: {
            id: '2',
            fullName: 'Admin User',
            email: 'admin@example.com',
            phone: '9876543210',
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        });
      } else if (email === 'owner@example.com' && password === 'password') {
        resolve({
          user: {
            id: '3',
            fullName: 'Owner User',
            email: 'owner@example.com',
            phone: '5555555555',
            role: 'owner',
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const signup = async (fullName: string, email: string, phone: string, password: string) => {
  // Simulate API call
  return new Promise<{ user: User; token: string }>((resolve, reject) => {
    setTimeout(() => {
      // In a real app, this would validate and create a user in the database
      if (email && password && fullName && phone) {
        resolve({
          user: {
            id: '4',
            fullName,
            email,
            phone,
            role: 'user', // Default role for new signups
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        });
      } else {
        reject(new Error('Invalid signup data'));
      }
    }, 1000);
  });
};

export const checkDocumentStatus = async (userId: string) => {
  // Simulate API call to check document status
  return new Promise<'pending' | 'approved' | 'rejected'>((resolve) => {
    setTimeout(() => {
      // In a real app, this would check the document status from the database
      // For now, randomly return a status
      const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      resolve(randomStatus);
    }, 500);
  });
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  // Simulate API call
  return new Promise<User>((resolve, reject) => {
    setTimeout(() => {
      // In a real app, this would update the user role in the database
      if (userId && role) {
        resolve({
          id: userId,
          fullName: 'Updated User',
          email: 'user@example.com',
          phone: '1234567890',
          role,
          createdAt: new Date().toISOString(),
        });
      } else {
        reject(new Error('Invalid user ID or role'));
      }
    }, 500);
  });
};