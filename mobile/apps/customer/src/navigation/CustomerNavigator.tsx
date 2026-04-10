import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomerHomeScreen from '../screens/home/CustomerHomeScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type CustomerTabParamList = {
  CustomerHome: undefined;
  Booking: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="CustomerHome" component={CustomerHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Booking" component={BookingScreen} options={{ title: 'Booking' }} />
      <Tab.Screen name="Notifications" component={NotificationCenterScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default CustomerNavigator;
