import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHomeScreen from '../screens/owner/OwnerHomeScreen';

const Stack = createNativeStackNavigator();

const OwnerNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} options={{ title: 'Owner' }} />
    </Stack.Navigator>
  );
};

export default OwnerNavigator;
