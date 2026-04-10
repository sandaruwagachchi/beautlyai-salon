import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';

const Stack = createNativeStackNavigator();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
