/**
 * Customer Navigator
 * Navigation stack for customer role
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import ServiceSelectionScreen from '../screens/customer/ServiceSelectionScreen';
import DateTimeSelectionScreen from '../screens/customer/DateTimeSelectionScreen';
import BookingConfirmScreen from '../screens/customer/BookingConfirmScreen';
import type { CustomerStackParamList } from './types';
import { BOOKING_TEXT } from '../constants/booking';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
      })}
    >
      <Stack.Screen
        name="CustomerHome"
        component={CustomerHomeScreen}
        options={{ title: BOOKING_TEXT.customerHomeNavTitle }}
      />
      <Stack.Screen
        name="ServiceSelection"
        component={ServiceSelectionScreen}
        options={{ title: BOOKING_TEXT.serviceSelectionTitle }}
      />
      <Stack.Screen
        name="DateTimeSelection"
        component={DateTimeSelectionScreen}
        options={{ title: BOOKING_TEXT.dateTimeSelectionTitle }}
      />
      <Stack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{ title: BOOKING_TEXT.bookingConfirmTitle }}
      />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;

