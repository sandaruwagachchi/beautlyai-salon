import React from 'react';
import { Alert, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigateToHome } from '@beautlyai/api';
import { tokenService, useAuthStore } from '@beautlyai/auth';
import CustomerNavigator from './CustomerNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

export type CustomerAuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<CustomerAuthStackParamList>();

const RootNavigator: React.FC = () => {
  const { token, user, isBootstrapping, setBootstrapping, setAuth, clearAuth } = useAuthStore();

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
    const enforceCustomerRole = async (): Promise<void> => {
      if (!token || !user) {
        return;
      }

      if (user.role !== 'CUSTOMER') {
        await tokenService.clear();
        clearAuth();
        Alert.alert('Wrong app for this account', 'Please use the BeautlyAI Business app.');
      }
    };

    void enforceCustomerRole();
  }, [token, user, clearAuth]);

  React.useEffect(() => {
    if (!token || !user || user.role !== 'CUSTOMER') {
      return;
    }

    const timer = setTimeout(() => {
      navigateToHome();
    }, 0);

    return () => clearTimeout(timer);
  }, [token, user]);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token || !user) {
    return (
      <Stack.Navigator key="customer-auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return <CustomerNavigator key="customer-app" />;
};

export default RootNavigator;
