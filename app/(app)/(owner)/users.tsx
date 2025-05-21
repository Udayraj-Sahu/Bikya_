import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  TextInput 
} from 'react-native';
import { useAppDispatch } from '@/redux/hooks';
import Colors from '@/constants/Colors';
import { Search, User as UserIcon, CheckCircle, Edit, UserCog } from 'lucide-react-native';
import { UserRole } from '@/types';
import { updateUserRole } from '@/services/authService';

// Mock users data
const mockUsers = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'user@example.com',
    phone: '1234567890',
    role: 'user' as UserRole,
    createdAt: new Date('2023-01-15').toISOString(),
  },
  {
    id: '2',
    fullName: 'Admin User',
    email: 'admin@example.com',
    phone: '9876543210',
    role: 'admin' as UserRole,
    createdAt: new Date('2023-02-20').toISOString(),
  },
  {
    id: '3',
    fullName: 'Owner User',
    email: 'owner@example.com',
    phone: '5555555555',
    role: 'owner' as UserRole,
    createdAt: new Date('2023-03-10').toISOString(),
  },
];

export default function UsersScreen() {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;
  
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // Don't allow changing the current owner's role
    const currentOwner = users.find(u => u.role === 'owner');
    if (currentOwner && currentOwner.id !== userId && newRole === 'owner') {
      Alert.alert(
        'Cannot Assign Owner Role',
        'There can only be one owner. Remove the owner role from the current owner first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Change User Role',
      `Are you sure you want to change this user's role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change Role', 
          onPress: async () => {
            try {
              await updateUserRole(userId, newRole);
              
              // Update the local state
              setUsers(prevUsers => 
                prevUsers.map(user => 
                  user.id === userId ? { ...user, role: newRole } : user
                )
              );
              
              setSelectedUser(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role');
            }
          }
        },
      ]
    );
  };
  
  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setSelectedUser(selectedUser === item.id ? null : item.id)}
        >
          <Edit size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{item.phone}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Member Since:</Text>
          <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current Role:</Text>
          <View style={[
            styles.roleBadge, 
            { 
              backgroundColor: 
                item.role === 'owner' 
                  ? `${Colors.light.primary}15` 
                  : item.role === 'admin' 
                    ? `${Colors.light.secondary}15` 
                    : `${Colors.light.tertiary}15` 
            }
          ]}>
            <Text style={[
              styles.roleText,
              { 
                color: 
                  item.role === 'owner' 
                    ? Colors.light.primary 
                    : item.role === 'admin' 
                      ? Colors.light.secondary 
                      : Colors.light.tertiary 
              }
            ]}>
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      {selectedUser === item.id && (
        <View style={styles.roleSelector}>
          <Text style={styles.roleSelectorTitle}>Change Role</Text>
          <View style={styles.roleOptions}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                item.role === 'user' && styles.roleOptionActive,
                { backgroundColor: item.role === 'user' ? `${Colors.light.tertiary}15` : '#F0F0F0' }
              ]}
              onPress={() => handleRoleChange(item.id, 'user')}
            >
              <Text style={[
                styles.roleOptionText,
                item.role === 'user' && { color: Colors.light.tertiary }
              ]}>
                User
              </Text>
              {item.role === 'user' && (
                <CheckCircle size={16} color={Colors.light.tertiary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleOption,
                item.role === 'admin' && styles.roleOptionActive,
                { backgroundColor: item.role === 'admin' ? `${Colors.light.secondary}15` : '#F0F0F0' }
              ]}
              onPress={() => handleRoleChange(item.id, 'admin')}
            >
              <Text style={[
                styles.roleOptionText,
                item.role === 'admin' && { color: Colors.light.secondary }
              ]}>
                Admin
              </Text>
              {item.role === 'admin' && (
                <CheckCircle size={16} color={Colors.light.secondary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleOption,
                item.role === 'owner' && styles.roleOptionActive,
                { backgroundColor: item.role === 'owner' ? `${Colors.light.primary}15` : '#F0F0F0' }
              ]}
              onPress={() => handleRoleChange(item.id, 'owner')}
            >
              <Text style={[
                styles.roleOptionText,
                item.role === 'owner' && { color: Colors.light.primary }
              ]}>
                Owner
              </Text>
              {item.role === 'owner' && (
                <CheckCircle size={16} color={Colors.light.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.grey4} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.grey4}
          />
        </View>
      </View>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total Users: {users.length}</Text>
      </View>
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserCog size={64} color={Colors.light.grey4} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.divider,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  summary: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.light.grey3,
  },
  usersList: {
    padding: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.grey3,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.grey3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleSelector: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: 16,
  },
  roleSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  roleOptionActive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.grey2,
    marginRight: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.grey3,
    textAlign: 'center',
  },
});