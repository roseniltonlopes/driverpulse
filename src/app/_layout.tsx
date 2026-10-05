import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';
import { useShiftStore } from '../stores/useShiftStore';
import { useFinanceStore } from '../stores/useFinanceStore';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const initializeAuth = useAuthStore(s => s.initialize);
  const loadShifts = useShiftStore(s => s.loadShifts);
  const loadTransactions = useFinanceStore(s => s.loadTransactions);

  useEffect(() => {
    const initApp = async () => {
      await initializeAuth();
      await loadShifts();
      await loadTransactions();
    };
    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/add-income"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modals/add-expense"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
