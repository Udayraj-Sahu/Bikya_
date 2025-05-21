import { Document } from '@/types';

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    userId: '1',
    uri: 'https://images.pexels.com/photos/3585089/pexels-photo-3585089.jpeg',
    type: 'idCard',
    side: 'front',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    uri: 'https://images.pexels.com/photos/3585088/pexels-photo-3585088.jpeg',
    type: 'idCard',
    side: 'back',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: '4',
    uri: 'https://images.pexels.com/photos/3791136/pexels-photo-3791136.jpeg',
    type: 'drivingLicense',
    side: 'front',
    status: 'approved',
    createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
  },
];

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDocuments);
    }, 500);
  });
};

// Get pending documents
export const getPendingDocuments = async (): Promise<Document[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const pendingDocs = mockDocuments.filter(doc => doc.status === 'pending');
      resolve(pendingDocs);
    }, 500);
  });
};

// Get documents by user ID
export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const userDocs = mockDocuments.filter(doc => doc.userId === userId);
      resolve(userDocs);
    }, 500);
  });
};

// Upload document
export const uploadDocument = async (document: Omit<Document, 'id' | 'createdAt' | 'status'>): Promise<Document> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDocument: Document = {
        ...document,
        id: (mockDocuments.length + 1).toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      mockDocuments.push(newDocument);
      resolve(newDocument);
    }, 1000); // Longer timeout to simulate image upload
  });
};

// Approve document
export const approveDocument = async (id: string): Promise<Document> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockDocuments.findIndex(doc => doc.id === id);
      if (index !== -1) {
        mockDocuments[index] = { ...mockDocuments[index], status: 'approved' };
        resolve(mockDocuments[index]);
      } else {
        reject(new Error('Document not found'));
      }
    }, 500);
  });
};

// Reject document
export const rejectDocument = async (id: string): Promise<Document> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockDocuments.findIndex(doc => doc.id === id);
      if (index !== -1) {
        mockDocuments[index] = { ...mockDocuments[index], status: 'rejected' };
        resolve(mockDocuments[index]);
      } else {
        reject(new Error('Document not found'));
      }
    }, 500);
  });
};