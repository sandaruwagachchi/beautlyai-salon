/**
 * Admin Navigator
 * Navigation stack for admin role
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';

type AdminTabParamList = {
  Home: undefined;
  Users: undefined;
  Salons: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Users') iconName = 'account-multiple';
          else if (route.name === 'Salons') iconName = 'store';
          else if (route.name === 'Reports') iconName = 'file-document';
          else iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={AdminHomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Users"
        component={AdminHomeScreen}
        options={{ title: 'User Management', headerShown: false }}
      />
      <Tab.Screen
        name="Salons"
        component={AdminHomeScreen}
        options={{ title: 'Salon Management', headerShown: false }}
      />
      <Tab.Screen
        name="Reports"
        component={AdminHomeScreen}
        options={{ title: 'Reports', headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminHomeScreen}
        options={{ title: 'Settings', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;

