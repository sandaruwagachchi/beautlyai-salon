/**
 * Root Navigation Navigator
 * Handles conditional navigation based on user authentication and role
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store';
import { authService } from '../services';
import CustomerNavigator from './CustomerNavigator';
import StaffNavigator from './StaffNavigator';
import OwnerNavigator from './OwnerNavigator';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';

const RootNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const { user, isAuthenticated, setUser, setToken } = useAuthStore();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await authService.getStoredToken();
        const role = await authService.getStoredRole();

        if (token && role) {
          // In a real app, validate the token with the backend
          setToken(token);
          setUser({
            id: '',
            email: '',
            fullName: '',
            role: role as any,
          });
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
      } finally {
        setInitializing(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'CUSTOMER' ? (
        <CustomerNavigator />
      ) : user?.role === 'STAFF' ? (
        <StaffNavigator />
      ) : user?.role === 'OWNER' ? (
        <OwnerNavigator />
      ) : user?.role === 'ADMIN' ? (
        <AdminNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;

