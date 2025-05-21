import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Document } from '@/types';
import * as documentService from '@/services/documentService';

interface DocumentState {
  documents: Document[];
  pendingDocuments: Document[];
  userDocuments: Document[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  pendingDocuments: [],
  userDocuments: [],
  isLoading: false,
  error: null,
};

export const fetchAllDocuments = createAsyncThunk(
  'documents/fetchAllDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const documents = await documentService.getAllDocuments();
      return documents;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch documents');
    }
  }
);

export const fetchPendingDocuments = createAsyncThunk(
  'documents/fetchPendingDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const documents = await documentService.getPendingDocuments();
      return documents;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch pending documents');
    }
  }
);

export const fetchUserDocuments = createAsyncThunk(
  'documents/fetchUserDocuments',
  async (userId: string, { rejectWithValue }) => {
    try {
      const documents = await documentService.getUserDocuments(userId);
      return documents;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user documents');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (document: Omit<Document, 'id' | 'createdAt' | 'status'>, { rejectWithValue }) => {
    try {
      const newDocument = await documentService.uploadDocument(document);
      return newDocument;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload document');
    }
  }
);

export const approveDocument = createAsyncThunk(
  'documents/approveDocument',
  async (id: string, { rejectWithValue }) => {
    try {
      const updatedDocument = await documentService.approveDocument(id);
      return updatedDocument;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to approve document');
    }
  }
);

export const rejectDocument = createAsyncThunk(
  'documents/rejectDocument',
  async (id: string, { rejectWithValue }) => {
    try {
      const updatedDocument = await documentService.rejectDocument(id);
      return updatedDocument;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reject document');
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all documents
    builder.addCase(fetchAllDocuments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllDocuments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchAllDocuments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch pending documents
    builder.addCase(fetchPendingDocuments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPendingDocuments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pendingDocuments = action.payload;
    });
    builder.addCase(fetchPendingDocuments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch user documents
    builder.addCase(fetchUserDocuments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserDocuments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userDocuments = action.payload;
    });
    builder.addCase(fetchUserDocuments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Upload document
    builder.addCase(uploadDocument.fulfilled, (state, action) => {
      state.userDocuments.push(action.payload);
    });

    // Approve document
    builder.addCase(approveDocument.fulfilled, (state, action) => {
      const index = state.pendingDocuments.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.pendingDocuments.splice(index, 1);
      }
      
      const docIndex = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (docIndex !== -1) {
        state.documents[docIndex] = action.payload;
      } else {
        state.documents.push(action.payload);
      }
    });

    // Reject document
    builder.addCase(rejectDocument.fulfilled, (state, action) => {
      const index = state.pendingDocuments.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.pendingDocuments.splice(index, 1);
      }
      
      const docIndex = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (docIndex !== -1) {
        state.documents[docIndex] = action.payload;
      } else {
        state.documents.push(action.payload);
      }
    });
  },
});

export const { clearErrors } = documentSlice.actions;
export default documentSlice.reducer;