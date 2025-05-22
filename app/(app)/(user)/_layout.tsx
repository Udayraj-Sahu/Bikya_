// app/(app)/(user)/_layout.tsx
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { Home, Search, ClipboardList, User as UserIcon, FileText, Bike } from 'lucide-react-native'; // Added FileText and Bike for icons

export default function UserLayout() {
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
        headerShown: false, // Assuming you handle headers in individual screens or a parent stack
      }}
    >
      <Tabs.Screen
        name="index" // Corresponds to app/(app)/(user)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore" // Corresponds to app/(app)/(user)/explore.tsx
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings" // Corresponds to app/(app)/(user)/bookings.tsx
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Corresponds to app/(app)/(user)/profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
        }}
      />

      {/* --- Screens not in Tab Bar but part of this (user) navigation stack --- */}
      
      <Tabs.Screen
        name="upload-documents" // Corresponds to app/(app)/(user)/upload-documents.tsx
        options={{
          title: 'Upload ID Proof', // Header title for this screen
          href: null,             // Hides this screen from the tab bar
          // headerShown: true,   // You might want a header for this specific screen
                                  // If headerShown is false in screenOptions, this will override it for this screen
        }}
      />
      <Tabs.Screen
        name="bike-details" // Corresponds to app/(app)/(user)/bike-details.tsx
        options={{
          title: 'Bike Details',
          href: null, // Hides from tab bar
          // headerShown: true,
        }}
      />
    </Tabs>
  );
}
