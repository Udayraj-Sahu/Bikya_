import React, { useEffect } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';

export default function AppLayout() {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);

  // Simple guard check without redirection that could cause loops
  if (!user) {
    // Use Redirect component instead of programmatic navigation
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(owner)" />
    </Stack>
  );
}