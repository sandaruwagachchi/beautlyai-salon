/**
 * Root Navigation Navigator
 * Handles conditional navigation based on user authentication and role
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store';
import { authService } from '../services';
import RoleGuard from './RoleGuard';

const RootNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const { setUser, setToken } = useAuthStore();

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
  }, [setToken, setUser]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RoleGuard />
    </NavigationContainer>
  );
};

export default RootNavigator;

