import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { navigationRef, setAuthRouteName } from '@beautlyai/api';
import CustomerNavigator from './src/navigation/CustomerNavigator';

setAuthRouteName('CustomerHome');

const App: React.FC = () => {
  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef}>
        <CustomerNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
