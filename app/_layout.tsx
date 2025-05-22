import React, { useEffect, useState } from 'react';
import { Stack, SplashScreen, router } from 'expo-router'; // Import SplashScreen and router
import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady'; // We'll integrate this or replace its ready signal
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks'; // Your typed hooks
import { initializeAuth } from '@/redux/slices/authSlice'; // Import the thunk

// Keep the splash screen visible while we fetch resources/auth state
SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const dispatch = useAppDispatch();
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAppSelector((state) => state.auth);
  // const frameworkReady = useFrameworkReady(); // If this loads fonts/assets, keep it

  // Local ready state for this component, to ensure useEffect runs once
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // This effect runs once when the component mounts
    dispatch(initializeAuth())
      .unwrap() // unwrap to handle promise resolution/rejection here if needed
      .catch((error) => {
        console.error('Failed to initialize auth:', error);
        // Handle error, maybe navigate to a specific error screen or just proceed
      })
      .finally(() => {
        // setIsAppReady(true); // Set app ready after auth initialization
        // SplashScreen.hideAsync(); // Hide splash screen once auth is initialized
        // The navigation logic below will handle hiding the splash screen
      });
  }, [dispatch]);


  useEffect(() => {
    // This effect will run when isAuthLoading changes (after initializeAuth completes)
    // and when frameworkReady changes (if you are using it for asset loading)
    if (!isAuthLoading ) { // Add && frameworkReady if using useFrameworkReady
      SplashScreen.hideAsync();
      setIsAppReady(true); // Now the app is truly ready to navigate
    }
  }, [isAuthLoading]); // Add frameworkReady to dependency array if used


  // This effect handles navigation after authentication state is known and app is ready
  useEffect(() => {
    if (!isAppReady) return; // Don't navigate until app is ready

    // This is a common pattern for Expo Router v3 for initial route handling
    // It assumes your (app) layout or index will handle role-based redirects further
    if (isAuthenticated && user) {
      // If authenticated, try to navigate to the main app area.
      // The (app)/_layout.tsx should then handle role-based tab navigators.
      router.replace('/(app)'as any);
    } else if (!isAuthenticated) {
      // If not authenticated, ensure user is on the auth flow or welcome screen.
      // Your index.tsx might be the welcome screen that leads to (auth)
      router.replace('/(auth)/login'); // Or your main entry point like '/' or '/welcome'
    }

  }, [isAuthenticated, user, isAppReady]);


  if (!isAppReady) {
    // While app is not ready (auth initializing, assets loading),
    // SplashScreen is visible. You can return null or a minimal loading indicator
    // but SplashScreen.preventAutoHideAsync() handles this.
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> {/* This could be your welcome/landing screen */}
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="(app)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  // The useFrameworkReady hook should ideally be called within a component
  // that is a child of the Provider if it dispatches Redux actions or reads from the store.
  // If it's purely for Expo assets and doesn't interact with Redux, its placement is more flexible.
  // For now, assuming it's for general readiness.

  return (
    <Provider store={store}>
      <RootNavigation />
      <StatusBar style="auto" />
    </Provider>
  );
}
