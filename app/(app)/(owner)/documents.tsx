// app/(app)/(owner)/documents.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, StyleProp, TextStyle } from 'react-native'; // Added StyleProp, TextStyle
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPendingDocumentsThunk, updateDocumentStatusThunk, clearDocumentError } from '@/redux/slices/documentSlice';
import { Document as DocumentType, User, DocumentApprovalStatus } from '@/types';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';

interface PendingDocumentItem extends DocumentType {
  user?: Partial<User>; 
}

export default function OwnerDocumentsScreen() {
  const dispatch = useAppDispatch();
  const { pendingDocuments, isLoading, error } = useAppSelector((state) => state.documents);
  const owner = useAppSelector((state) => state.auth.user); 

  useEffect(() => {
    if (owner?.role === 'owner') {
      dispatch(fetchPendingDocumentsThunk());
    }
    dispatch(clearDocumentError());
  }, [dispatch, owner?.role]);

  const handleUpdateStatus = (documentId: string, status: 'approved' | 'rejected') => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${status} this document?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            const resultAction = await dispatch(updateDocumentStatusThunk({ documentId, status }));
            if (updateDocumentStatusThunk.fulfilled.match(resultAction)) {
              Alert.alert('Success', `Document has been ${status}.`);
            } else {
              Alert.alert('Error', resultAction.payload as string || `Failed to ${status} document.`);
            }
          } 
        }
      ]
    );
  };

  // Helper function to get status style
  const getStatusStyle = (status: DocumentApprovalStatus): StyleProp<TextStyle> => {
    if (status === 'pending') return styles.statusPending;
    if (status === 'approved') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    return {}; // Default or no specific style
  };

  const renderDocumentItem = ({ item }: { item: PendingDocumentItem }) => (
    <View style={styles.documentItem}>
      <Text style={styles.itemTitle}>Document ID: <Text style={styles.itemValue}>{item.id}</Text></Text>
      {item.user && (
        <>
          <Text style={styles.itemText}>User: <Text style={styles.itemValue}>{item.user.fullName} ({item.user.email})</Text></Text>
        </>
      )}
      <Text style={styles.itemText}>Type: <Text style={styles.itemValue}>{item.documentType}</Text></Text>
      {/* Corrected line for status style */}
      <Text style={styles.itemText}>
        Status: <Text style={[styles.itemValue, getStatusStyle(item.status)]}>{item.status}</Text>
      </Text>
      <Text style={styles.itemText}>Submitted: <Text style={styles.itemValue}>{new Date(item.createdAt).toLocaleDateString()}</Text></Text>
      
      {item.frontImageUri && <Text style={styles.imageLink}>Front Image: <Text style={styles.linkText} onPress={() => {/* Open image */}}>{item.frontImageUri.substring(item.frontImageUri.lastIndexOf('/') + 1)}</Text></Text>}
      {item.backImageUri && <Text style={styles.imageLink}>Back Image: <Text style={styles.linkText} onPress={() => {/* Open image */}}>{item.backImageUri.substring(item.backImageUri.lastIndexOf('/') + 1)}</Text></Text>}
      
      {item.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <Button 
            title="Approve" 
            onPress={() => handleUpdateStatus(item.id, 'approved')} 
            type="secondary"
            style={styles.actionButton}
          />
          <Button 
            title="Reject" 
            onPress={() => handleUpdateStatus(item.id, 'rejected')} 
            type="danger" 
            style={styles.actionButton}
          />
        </View>
      )}
    </View>
  );

  if (isLoading && pendingDocuments.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text>Loading pending documents...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={() => dispatch(fetchPendingDocumentsThunk())} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Pending Document Approvals</Text>
      {pendingDocuments.length === 0 && !isLoading ? (
        <View style={styles.centered}>
            <Text style={styles.noDocumentsText}>No documents are currently pending approval.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingDocuments as PendingDocumentItem[]} 
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshing={isLoading} 
          onRefresh={() => dispatch(fetchPendingDocumentsThunk())} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.tint,
    padding: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  documentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 3,
  },
  itemValue: {
    fontWeight: 'normal',
    color: '#555',
  },
  // Ensure these styles are defined for status colors
  statusPending: { 
    color: 'orange',
    fontWeight: 'bold',
  },
  statusApproved: { 
    color: 'green',
    fontWeight: 'bold',
   },
  statusRejected: { 
    color: 'red',
    fontWeight: 'bold',
  },
  imageLink: {
    fontSize: 14,
    marginTop: 5,
  },
  linkText: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
  },
  actionButton: {
    paddingHorizontal: 10, 
    minHeight: 40,
  },
  noDocumentsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  }
});
