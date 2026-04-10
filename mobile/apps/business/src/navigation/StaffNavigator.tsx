import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffHomeScreen from '../screens/staff/StaffHomeScreen';
import ScheduleScreen from '../screens/staff/ScheduleScreen';
import ClientDetailScreen from '../screens/staff/ClientDetailScreen';
import CheckoutScreen from '../screens/staff/CheckoutScreen';

const Stack = createNativeStackNavigator();

const StaffNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} options={{ title: 'Staff' }} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Schedule' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Client Detail' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
