import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

export default function RootLayout() {
  // Avoid any state operations in the initial render
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Set ready state in useEffect to avoid render loops
    setIsReady(true);
  }, []);
  
  // Call hooks safely
  useFrameworkReady();

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(app)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </Provider>
  );
}