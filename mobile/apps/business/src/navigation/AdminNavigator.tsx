import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import PlatformOverviewScreen from '../screens/admin/PlatformOverviewScreen';
import KycReviewScreen from '../screens/admin/KycReviewScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';
import LogoutHeaderButton from './LogoutHeaderButton';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
      <Stack.Screen
        name="PlatformOverview"
        component={PlatformOverviewScreen}
        options={{ title: 'Platform Overview' }}
      />
      <Stack.Screen name="KycReview" component={KycReviewScreen} options={{ title: 'KYC Review' }} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} options={{ title: 'Audit Logs' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
