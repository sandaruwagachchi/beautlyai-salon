/**
 * Customer Navigator
 * Navigation stack for customer role
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Bookings') iconName = 'calendar';
          else if (route.name === 'Profile') iconName = 'account';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Bookings"
        component={CustomerHomeScreen}
        options={{ title: 'My Bookings', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerHomeScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default CustomerNavigator;

