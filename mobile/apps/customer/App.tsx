import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { navigationRef, setAuthRouteName } from '@beautlyai/api';
import RootNavigator from './src/navigation/RootNavigator';

setAuthRouteName('Login');

const App: React.FC = () => {
  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
