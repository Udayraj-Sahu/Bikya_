// frontend/redux/slices/documentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as documentService from '@/services/documentService';
import { Document as DocumentType } from '@/types'; // Your Document type
import { fetchUserProfile } from './authSlice'; // To refresh user profile after document status change

interface DocumentState {
  userDocuments: DocumentType[];
  pendingDocuments: DocumentType[]; // For owner
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  userDocuments: [],
  pendingDocuments: [],
  isLoading: false,
  isUploading: false,
  error: null,
};

// Thunk for user to upload their document(s)
export const uploadUserDocumentThunk = createAsyncThunk(
  'documents/uploadUserDocument',
  async (formData: FormData, { rejectWithValue, dispatch }) => {
    try {
      const response = await documentService.uploadDocument(formData);
      // After successful upload, refresh the user's documents list
      dispatch(fetchUserDocumentsThunk());
      // Also refresh user profile to get updated idProofSubmitted status
      dispatch(fetchUserProfile());
      return response.documents; // Or response.message, depending on what you want to use
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Document upload failed');
    }
  }
);

// Thunk for user to fetch their own documents
export const fetchUserDocumentsThunk = createAsyncThunk(
  'documents/fetchUserDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const documents = await documentService.getUserDocuments();
      return documents;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user documents');
    }
  }
);

// Thunk for owner to fetch pending documents
export const fetchPendingDocumentsThunk = createAsyncThunk(
  'documents/fetchPendingDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const documents = await documentService.getPendingDocuments();
      return documents;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch pending documents');
    }
  }
);

// Thunk for owner to update a document's status
export const updateDocumentStatusThunk = createAsyncThunk(
  'documents/updateDocumentStatus',
  async ({ documentId, status }: { documentId: string; status: 'approved' | 'rejected' }, { rejectWithValue, dispatch }) => {
    try {
      const updatedDocument = await documentService.updateDocumentStatus(documentId, status);
      // Refresh the list of pending documents for the owner
      dispatch(fetchPendingDocumentsThunk());
      // Also refresh the specific user's profile in authSlice if their document status changed
      // This is a bit indirect; ideally, the backend might return the updated user or you fetch it.
      // For now, the owner UI will see the list update. The user will see it on next profile fetch.
      // Or, if you know the user ID from updatedDocument.user, you could dispatch fetchUserProfile(userId)
      // For simplicity, we'll rely on the owner's list refreshing.
      // To update the user's `idProofApproved` status visible to them, `fetchUserProfile` should be called for that user.
      // This can be triggered on the user's profile screen or after they get a notification.
      return updatedDocument;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update document status');
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Upload User Document
    builder
      .addCase(uploadUserDocumentThunk.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadUserDocumentThunk.fulfilled, (state, action) => {
        state.isUploading = false;
        // Optionally add to userDocuments list if backend returns them and you want to update immediately
        // state.userDocuments = action.payload; // Or merge
        // For now, relying on fetchUserDocumentsThunk to refresh
      })
      .addCase(uploadUserDocumentThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      });

    // Fetch User Documents
    builder
      .addCase(fetchUserDocumentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDocumentsThunk.fulfilled, (state, action: PayloadAction<DocumentType[]>) => {
        state.isLoading = false;
        state.userDocuments = action.payload;
      })
      .addCase(fetchUserDocumentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Pending Documents (Owner)
    builder
      .addCase(fetchPendingDocumentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingDocumentsThunk.fulfilled, (state, action: PayloadAction<DocumentType[]>) => {
        state.isLoading = false;
        state.pendingDocuments = action.payload;
      })
      .addCase(fetchPendingDocumentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Document Status (Owner)
    builder
      .addCase(updateDocumentStatusThunk.pending, (state) => {
        state.isLoading = true; // Or a specific loading flag like isUpdatingStatus
        state.error = null;
      })
      .addCase(updateDocumentStatusThunk.fulfilled, (state, action: PayloadAction<DocumentType>) => {
        state.isLoading = false;
        // The list of pending documents is refreshed by the thunk dispatching fetchPendingDocumentsThunk
        // You could also manually update the specific document in the pendingDocuments list here if needed:
        // state.pendingDocuments = state.pendingDocuments.filter(doc => doc.id !== action.payload.id);
      })
      .addCase(updateDocumentStatusThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;
