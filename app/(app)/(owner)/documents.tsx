import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPendingDocuments, approveDocument, rejectDocument } from '@/redux/slices/documentSlice';
import Colors from '@/constants/Colors';
import { FileText, CheckCircle, XCircle } from 'lucide-react-native';
import DocumentCard from '@/components/DocumentCard';

export default function DocumentsScreen() {
  const dispatch = useAppDispatch();
  const { pendingDocuments, isLoading } = useAppSelector(state => state.documents);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    dispatch(fetchPendingDocuments());
  }, [dispatch]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPendingDocuments());
    setRefreshing(false);
  };
  
  const handleApproveDocument = (id: string) => {
    Alert.alert(
      'Approve Document',
      'Are you sure you want to approve this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            dispatch(approveDocument(id));
          }
        },
      ]
    );
  };
  
  const handleRejectDocument = (id: string) => {
    Alert.alert(
      'Reject Document',
      'Are you sure you want to reject this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          onPress: () => {
            dispatch(rejectDocument(id));
          },
          style: 'destructive'
        },
      ]
    );
  };
  
  const renderTabBar = () => {
    return (
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Pending ({pendingDocuments.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Approved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Rejected</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Verification</Text>
      </View>
      
      {renderTabBar()}
      
      {pendingDocuments.length > 0 ? (
        <FlatList
          data={pendingDocuments}
          renderItem={({ item }) => (
            <DocumentCard 
              document={item} 
              showActions={true}
              onApprove={handleApproveDocument}
              onReject={handleRejectDocument}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.documentsList}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FileText size={64} color={Colors.light.grey4} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No pending documents</Text>
          <Text style={styles.emptySubtext}>All documents have been reviewed</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.grey3,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  documentsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.grey3,
    textAlign: 'center',
  },
});