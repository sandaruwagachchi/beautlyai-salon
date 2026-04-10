import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffHomeScreen from '../screens/staff/StaffHomeScreen';

const Stack = createNativeStackNavigator();

const StaffNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} options={{ title: 'Staff' }} />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
