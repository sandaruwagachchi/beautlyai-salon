import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { RootNavigator } from './src/navigation';

export default function App() {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
