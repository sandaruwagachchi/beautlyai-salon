import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { authApi } from '@beautlyai/api';
import { useAuthStore } from '@beautlyai/auth';
import { tokenService } from '@beautlyai/auth';

const LoginScreen: React.FC = () => {
  const idPrefix = React.useId().replace(/[:]/g, '_');
  const { setAuth } = useAuthStore();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onLogin = async (): Promise<void> => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authApi.login({
        username: username.trim(),
        password,
      });

      await tokenService.writeSession({
        token: response.token,
        role: response.role,
        username: response.username,
      });

      setAuth(response.token, {
        username: response.username,
        role: response.role,
      });

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">BeautlyAI Business</Text>
      <Text variant="bodyMedium">Sign in with staff, owner, or admin credentials</Text>
      <TextInput
        label="Username"
        mode="outlined"
        autoCapitalize="none"
        autoComplete="username"
        textContentType={Platform.OS === 'ios' ? 'username' : 'none'}
        nativeID={`${idPrefix}-business-login-username`}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        autoComplete="current-password"
        textContentType={Platform.OS === 'ios' ? 'password' : 'none'}
        nativeID={`${idPrefix}-business-login-password`}
        value={password}
        onChangeText={setPassword}
      />
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
      <Pressable
        onPress={() => void onLogin()}
        disabled={loading}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
      >
        <Text style={styles.primaryButtonText}>{loading ? 'Loading...' : 'Login'}</Text>
      </Pressable>
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
  primaryButton: {
    backgroundColor: '#6c4fb2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
