import React from 'react';
import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@beautlyai/auth';
import { tokenService } from '@beautlyai/auth';
import StaffNavigator from './StaffNavigator';
import OwnerNavigator from './OwnerNavigator';
import AdminNavigator from './AdminNavigator';
import LoginScreen from '../screens/staff/LoginScreen';

export type BusinessStackParamList = {
  Login: undefined;
  StaffRoot: undefined;
  OwnerRoot: undefined;
  AdminRoot: undefined;
};

const Stack = createNativeStackNavigator<BusinessStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, token, clearAuth } = useAuthStore();

  React.useEffect(() => {
    const guard = async (): Promise<void> => {
      if (!token || !user?.role) {
        return;
      }

      if (user.role === 'CUSTOMER') {
        await tokenService.clear();
        clearAuth();
        Alert.alert(
          'Wrong app for this account',
          'This app is for salon staff and owners. Please download the BeautlyAI customer app.'
        );
      }
    };

    void guard();
  }, [token, user?.role, clearAuth]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token || !user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === 'STAFF' ? (
        <Stack.Screen name="StaffRoot" component={StaffNavigator} />
      ) : user.role === 'OWNER' ? (
        <Stack.Screen name="OwnerRoot" component={OwnerNavigator} />
      ) : user.role === 'ADMIN' ? (
        <Stack.Screen name="AdminRoot" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
