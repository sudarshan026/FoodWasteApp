import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { DonationProvider } from './src/context/DonationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <DonationProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </DonationProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}
