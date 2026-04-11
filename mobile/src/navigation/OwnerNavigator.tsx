/**
 * Owner Navigator
 * Navigation stack for owner role
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OwnerHomeScreen from '../screens/owner/OwnerHomeScreen';

type OwnerTabParamList = {
  Home: undefined;
  Analytics: undefined;
  Staff: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<OwnerTabParamList>();

const OwnerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Analytics') iconName = 'chart-line';
          else if (route.name === 'Staff') iconName = 'account-multiple';
          else iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={OwnerHomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Analytics"
        component={OwnerHomeScreen}
        options={{ title: 'Analytics', headerShown: false }}
      />
      <Tab.Screen
        name="Staff"
        component={OwnerHomeScreen}
        options={{ title: 'Staff Management', headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={OwnerHomeScreen}
        options={{ title: 'Settings', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default OwnerNavigator;

