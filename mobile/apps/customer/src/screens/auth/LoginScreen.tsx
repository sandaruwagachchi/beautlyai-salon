import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { authApi } from '@beautlyai/api';
import { useAuthStore, tokenService } from '@beautlyai/auth';
import type { CustomerAuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<CustomerAuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const idPrefix = React.useId().replace(/[:]/g, '_');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { setAuth } = useAuthStore();

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

      // On web, force a hard transition so bootstrap reads persisted session and loads app stack.
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
      const status = axiosErr.response?.status;
      const backendMessage =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        axiosErr.message;

      if (status === 401) {
        setError('Invalid credentials. Please try again.');
      } else if (status === 403) {
        setError('Access denied by server. Check backend security/CORS settings.');
      } else if (!axiosErr.response) {
        setError('Unable to reach server. Check backend URL and network connection.');
      } else {
        setError(`Login failed (${status ?? 'unknown'}): ${backendMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome back</Text>
      <TextInput
        label="Username"
        mode="outlined"
        autoCapitalize="none"
        autoComplete="username"
        textContentType={Platform.OS === 'ios' ? 'username' : 'none'}
        nativeID={`${idPrefix}-login-username`}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        autoComplete="current-password"
        textContentType={Platform.OS === 'ios' ? 'password' : 'none'}
        nativeID={`${idPrefix}-login-password`}
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
      <Pressable onPress={() => navigation.navigate('Register')} disabled={loading}>
        <Text style={styles.secondaryButtonText}>Create account</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 10,
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
  secondaryButtonText: {
    color: '#6c4fb2',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
