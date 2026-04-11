import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHomeScreen from '../screens/owner/OwnerHomeScreen';
import DashboardScreen from '../screens/owner/DashboardScreen';
import ReportsScreen from '../screens/owner/ReportsScreen';
import StaffManagementScreen from '../screens/owner/StaffManagementScreen';
import LogoutHeaderButton from './LogoutHeaderButton';
import type { OwnerStackParamList } from './types';

const Stack = createNativeStackNavigator<OwnerStackParamList>();

const OwnerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} options={{ title: 'Owner' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen
        name="StaffManagement"
        component={StaffManagementScreen}
        options={{ title: 'Staff Management' }}
      />
    </Stack.Navigator>
  );
};

export default OwnerNavigator;
