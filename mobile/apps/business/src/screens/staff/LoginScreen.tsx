import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuthStore, type UserRole } from '@beautlyai/auth';
import { tokenService } from '@beautlyai/auth';

const LoginScreen: React.FC = () => {
  const { setAuth } = useAuthStore();

  const signInAs = async (role: UserRole): Promise<void> => {
    const token = `mock-token-${role.toLowerCase()}`;

    await tokenService.writeToken(token);
    await tokenService.writeRole(role);

    setAuth(token, {
      id: `id-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@beautlyai.com`,
      fullName: `${role} User`,
      role,
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">BeautlyAI Business</Text>
      <Text variant="bodyMedium">Development sign-in options</Text>
      <Button mode="contained" onPress={() => void signInAs('STAFF')}>Sign in as STAFF</Button>
      <Button mode="contained" onPress={() => void signInAs('OWNER')}>Sign in as OWNER</Button>
      <Button mode="contained" onPress={() => void signInAs('ADMIN')}>Sign in as ADMIN</Button>
      <Button mode="outlined" onPress={() => void signInAs('CUSTOMER')}>Test CUSTOMER rejection</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
});

export default LoginScreen;
