// app/(app)/(admin)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ListChecks, UserCircle, Bike as BikeIcon } from 'lucide-react-native'; 
import Colors from '@/constants/Colors';

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary, 
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.divider,
        },
        headerShown: false, 
      }}
    >
      <Tabs.Screen
        name="index" // Corresponds to app/(app)/(admin)/index.tsx (Dashboard)
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory" // Corresponds to app/(app)/(admin)/inventory.tsx
        options={{
          title: 'Bike Inventory',
          tabBarIcon: ({ color, size }) => <BikeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings" // <<<< ENSURE THIS MATCHES FILENAME 'bookings.tsx'
        options={{
          title: 'All Bookings',
          tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} />,
        }}
      />
      {/* Optional Profile Tab for Admin */}
      {/* <Tabs.Screen
        name="profile" // Create app/(app)/(admin)/profile.tsx if needed
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
          // href: null, // If it's not a primary tab but part of the stack
        }}
      /> */}
    </Tabs>
  );
}
