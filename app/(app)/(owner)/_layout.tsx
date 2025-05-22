// app/(app)/(owner)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, FileCheck, UserCircle } from 'lucide-react-native'; // Example icons
import Colors from '@/constants/Colors';

export default function OwnerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary, // Or a specific owner theme color
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.divider,
        },
        headerShown: false, // Assuming headers are handled by screens or a parent stack
      }}
    >
      <Tabs.Screen
        name="index" // Corresponds to app/(app)/(owner)/index.tsx (Dashboard)
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="documents" // Corresponds to app/(app)/(owner)/documents.tsx
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => <FileCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users" // Corresponds to app/(app)/(owner)/users.tsx (Role Management)
        options={{
          title: 'Manage Users',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      {/* You can add a Profile tab for the Owner as well */}
      {/* <Tabs.Screen
        name="profile" // Create app/(app)/(owner)/profile.tsx if needed
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
