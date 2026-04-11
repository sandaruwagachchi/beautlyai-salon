/**
 * Staff Navigator
 * Navigation stack for staff role
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StaffHomeScreen from '../screens/staff/StaffHomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StaffNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Schedule') iconName = 'calendar';
          else if (route.name === 'Clients') iconName = 'account-multiple';
          else if (route.name === 'Profile') iconName = 'account';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={StaffHomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Schedule"
        component={StaffHomeScreen}
        options={{ title: 'Schedule', headerShown: false }}
      />
      <Tab.Screen
        name="Clients"
        component={StaffHomeScreen}
        options={{ title: 'Clients', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={StaffHomeScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default StaffNavigator;

