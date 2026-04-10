import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store';
import AuthNavigator from './AuthNavigator';
import StaffNavigator from './StaffNavigator';
import OwnerNavigator from './OwnerNavigator';
import AdminNavigator from './AdminNavigator';

const BUSINESS_ROLES = new Set(['STAFF', 'OWNER', 'ADMIN']);

const RoleGuard: React.FC = () => {
  const { token, user, clearAuth } = useAuthStore();
  const hasHandledCustomerRole = useRef(false);
  const role = user?.role;

  useEffect(() => {
    const forceBusinessSignOut = async () => {
      if (!token || role !== 'CUSTOMER' || hasHandledCustomerRole.current) {
        return;
      }

      hasHandledCustomerRole.current = true;

      try {
        await Promise.all([
          SecureStore.deleteItemAsync('jwt_token'),
          SecureStore.deleteItemAsync('user_role'),
          SecureStore.deleteItemAsync('auth-storage'),
        ]);
      } catch (error) {
        console.error('Failed to clear auth data for CUSTOMER role:', error);
      } finally {
        clearAuth();
        Alert.alert(
          'Wrong app for this account',
          'This app is for salon staff and owners. Please download the BeautlyAI customer app.'
        );
      }
    };

    void forceBusinessSignOut();
  }, [token, role, clearAuth]);

  if (!token) {
    return <AuthNavigator />;
  }

  if (!role) {
    return <AuthNavigator />;
  }

  if (role === 'CUSTOMER') {
    return <AuthNavigator />;
  }

  if (!BUSINESS_ROLES.has(role)) {
    return <AuthNavigator />;
  }

  if (role === 'STAFF') {
    return <StaffNavigator />;
  }

  if (role === 'OWNER') {
    return <OwnerNavigator />;
  }

  return <AdminNavigator />;
};

export default RoleGuard;