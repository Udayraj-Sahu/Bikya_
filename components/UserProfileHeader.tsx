import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { User } from '@/types';
import Colors from '@/constants/Colors';
import { User as UserIcon, Mail, Phone, MapPin } from 'lucide-react-native';

interface UserProfileHeaderProps {
  user: User;
  onEditPress?: () => void;
}

export default function UserProfileHeader({ user, onEditPress }: UserProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        {onEditPress && (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.name}>{user.fullName}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <UserIcon size={16} color={Colors.light.grey3} />
          <Text style={styles.infoText}>Member since {new Date(user.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoItem}>
          <Mail size={16} color={Colors.light.grey3} />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Phone size={16} color={Colors.light.grey3} />
          <Text style={styles.infoText}>{user.phone}</Text>
        </View>
        {user.location && (
          <View style={styles.infoItem}>
            <MapPin size={16} color={Colors.light.grey3} />
            <Text style={styles.infoText}>
              Location: {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: -5,
    right: -15,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  editText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: `${Colors.light.secondary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  roleText: {
    color: Colors.light.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.grey2,
    marginLeft: 12,
  },
});