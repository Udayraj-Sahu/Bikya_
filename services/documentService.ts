// frontend/services/documentService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Document as DocumentType, DocumentApprovalStatus } from '@/types'; // Assuming Document type is defined in types

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'; // Ensure this is correct

// Helper to get the token
const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

interface UploadDocumentResponse {
  message: string;
  documents: DocumentType[]; // Or a single DocumentType if only one is created per call
}

// Function to upload document(s)
export const uploadDocument = async (formData: FormData): Promise<UploadDocumentResponse> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for document upload');

  // FormData will be sent as multipart/form-data, Axios handles the Content-Type
  const response = await axios.post(`${API_BASE_URL}/documents`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type': 'multipart/form-data', // Axios usually sets this automatically for FormData
    },
  });
  return response.data; // Assuming backend returns { status: 'success', message: '...', data: { documents: [...] } }
                        // Adjust to: return response.data.data
};

// Function to get the current user's documents
export const getUserDocuments = async (): Promise<DocumentType[]> => {
  const token = await getToken();
  if (!token) throw new Error('No token found for fetching documents');

  const response = await axios.get<{ data: { documents: DocumentType[] } }>(`${API_BASE_URL}/documents/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.documents; // Assuming backend returns { status: 'success', results: ..., data: { documents: [...] } }
};


// --- Functions for Owner ---
interface PendingDocument extends DocumentType {
  user: { // Assuming user details are populated
    fullName: string;
    email: string;
    phone?: string;
  };
}

export const getPendingDocuments = async (): Promise<PendingDocument[]> => {
    const token = await getToken();
    if (!token) throw new Error('No token found for fetching pending documents');

    const response = await axios.get<{data: {documents: PendingDocument[]}}>(`${API_BASE_URL}/documents/pending`, {
        headers: { Authorization: `Bearer ${token}`},
    });
    return response.data.data.documents;
};

export const updateDocumentStatus = async (
    documentId: string,
    status: 'approved' | 'rejected'
): Promise<DocumentType> => {
    const token = await getToken();
    if (!token) throw new Error('No token found for updating document status');

    const response = await axios.patch<{data: {document: DocumentType}}>(
        `${API_BASE_URL}/documents/${documentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}`}}
    );
    return response.data.data.document;
};
