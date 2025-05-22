// app/(app)/(user)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { Home, Search, ClipboardList, User as UserIcon, FileText, Bike, CreditCard, CalendarDays } from 'lucide-react-native'; // Added more icons

export default function UserTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.divider,
          elevation: 0, // for Android
          shadowOpacity: 0, // for iOS
        },
        // headerShown: false, // Set this if you want to control headers per screen or in a parent stack
      }}
    >
      {/* Visible Tabs */}
      <Tabs.Screen
        name="index" // Corresponds to app/(app)/(user)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false, // Example: No header for home screen
        }}
      />
      <Tabs.Screen
        name="explore" // Corresponds to app/(app)/(user)/explore.tsx
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          headerShown: false, // Example: No header for explore screen
        }}
      />
      <Tabs.Screen
        name="bookings" // Corresponds to app/(app)/(user)/bookings.tsx
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
          // headerShown: true, // Example: Show header for bookings list
        }}
      />
      <Tabs.Screen
        name="profile" // Corresponds to app/(app)/(user)/profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
          // headerShown: true, // Example: Show header for profile
        }}
      />

      {/* --- Screens that are part of this stack but NOT visible in the Tab Bar --- */}
      
      <Tabs.Screen
        name="upload-documents" // Corresponds to app/(app)/(user)/upload-documents.tsx
        options={{
          title: 'Upload ID Proof', // Header title for this screen when navigated to
          href: null,             // This HIDES the screen from the tab bar
          headerShown: true,      // You might want a header for this screen
        }}
      />
      <Tabs.Screen
        name="bike-details" // Corresponds to app/(app)/(user)/bike-details.tsx
        options={{
          title: 'Bike Details',
          href: null, // Hides from tab bar
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="create-booking" // Corresponds to app/(app)/(user)/create-booking.tsx
        options={{
          title: 'Book Your Bike',
          href: null, // Hides from tab bar
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="payment-screen" // Corresponds to app/(app)/(user)/payment-screen.tsx
        options={{
            title: 'Complete Payment',
            href: null, // Hides from tab bar
            headerShown: true,
        }}
      />
      {/* Add any other screens in the (user) group here that shouldn't be tabs */}

    </Tabs>
  );
}
