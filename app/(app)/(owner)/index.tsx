import { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllBookings } from '@/redux/slices/bookingSlice';
import { fetchPendingDocuments } from '@/redux/slices/documentSlice';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Users, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react-native';

export default function OwnerDashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { bookings } = useAppSelector(state => state.bookings);
  const { pendingDocuments } = useAppSelector(state => state.documents);
  
  useEffect(() => {
    dispatch(fetchAllBookings());
    dispatch(fetchPendingDocuments());
  }, [dispatch]);
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.fullName.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>Welcome to your owner dashboard</Text>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/(app)/(owner)/documents')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.warning }]}>
              <AlertCircle size={24} color="white" />
            </View>
            <Text style={styles.statValue}>{pendingDocuments.length}</Text>
            <Text style={styles.statLabel}>Pending Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/(app)/(owner)/users')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.secondary }]}>
              <Users size={24} color="white" />
            </View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>
        </View>
        
        {/* Document Approval Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Document Summary</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(owner)/documents')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.documentStats}>
            <View style={styles.documentStatItem}>
              <View style={[styles.docIconContainer, { backgroundColor: `${Colors.light.warning}20` }]}>
                <AlertCircle size={20} color={Colors.light.warning} />
              </View>
              <Text style={styles.docStatValue}>{pendingDocuments.length}</Text>
              <Text style={styles.docStatLabel}>Pending</Text>
            </View>
            
            <View style={styles.documentStatItem}>
              <View style={[styles.docIconContainer, { backgroundColor: `${Colors.light.success}20` }]}>
                <CheckCircle size={20} color={Colors.light.success} />
              </View>
              <Text style={styles.docStatValue}>5</Text>
              <Text style={styles.docStatLabel}>Approved</Text>
            </View>
            
            <View style={styles.documentStatItem}>
              <View style={[styles.docIconContainer, { backgroundColor: `${Colors.light.danger}20` }]}>
                <XCircle size={20} color={Colors.light.danger} />
              </View>
              <Text style={styles.docStatValue}>2</Text>
              <Text style={styles.docStatLabel}>Rejected</Text>
            </View>
          </View>
        </View>
        
        {/* User Roles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>User Roles</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(owner)/users')}>
              <Text style={styles.seeAllText}>Manage Roles</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.userRoles}>
            <View style={styles.roleItem}>
              <View style={[styles.roleIconContainer, { backgroundColor: `${Colors.light.tertiary}20` }]}>
                <Users size={20} color={Colors.light.tertiary} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>Users</Text>
                <Text style={styles.roleCount}>1 User</Text>
              </View>
            </View>
            
            <View style={styles.roleItem}>
              <View style={[styles.roleIconContainer, { backgroundColor: `${Colors.light.secondary}20` }]}>
                <FileText size={20} color={Colors.light.secondary} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>Admins</Text>
                <Text style={styles.roleCount}>1 Admin</Text>
              </View>
            </View>
            
            <View style={styles.roleItem}>
              <View style={[styles.roleIconContainer, { backgroundColor: `${Colors.light.primary}20` }]}>
                <Users size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>Owners</Text>
                <Text style={styles.roleCount}>1 Owner (You)</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Business Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Metrics</Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{bookings.length}</Text>
              <Text style={styles.metricLabel}>Total Bookings</Text>
            </View>
            
            <View style={styles.metricDivider} />
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                ₹{bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)}
              </Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.light.primary }]}
              onPress={() => router.push('/(app)/(owner)/documents')}
            >
              <Text style={styles.actionButtonText}>Review Documents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.light.secondary }]}
              onPress={() => router.push('/(app)/(owner)/users')}
            >
              <Text style={styles.actionButtonText}>Manage Users</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.grey3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.grey3,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  documentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  docIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  docStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  docStatLabel: {
    fontSize: 12,
    color: Colors.light.grey3,
  },
  userRoles: {
    marginBottom: 8,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  roleCount: {
    fontSize: 12,
    color: Colors.light.grey3,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.divider,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.light.grey3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});