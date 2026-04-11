import React from 'react';
import { Alert, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
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
  const { user, token, isBootstrapping, setBootstrapping, setAuth, clearAuth } = useAuthStore();

  React.useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      try {
        const session = await tokenService.readSession();
        if (session) {
          setAuth(session.token, {
            username: session.username,
            role: session.role,
          });
        }
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrap();
  }, [setAuth, setBootstrapping]);

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

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator key={token && user ? 'business-app' : 'business-auth'} screenOptions={{ headerShown: false }}>
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
