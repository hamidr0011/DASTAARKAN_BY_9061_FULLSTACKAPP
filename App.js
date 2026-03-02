
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ReservationsProvider } from './src/context/ReservationsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ReservationsProvider>
          <CartProvider>
            <AppNavigator />
            <StatusBar style="light" backgroundColor="#8B0000" />
          </CartProvider>
        </ReservationsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
