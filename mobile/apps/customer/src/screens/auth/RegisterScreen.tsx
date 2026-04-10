import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { authApi } from '@beautlyai/api';
import type { CustomerAuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<CustomerAuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const idPrefix = React.useId().replace(/[:]/g, '_');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onRegister = async (): Promise<void> => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await authApi.register({
        username: username.trim(),
        password,
      });

      setSuccessMessage('Registration successful. Please login with your new account.');
      navigation.replace('Login');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
      const status = axiosErr.response?.status;
      const backendMessage =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.error ??
        axiosErr.message;

      if (status === 409) {
        setError('Username already exists. Please use a different username.');
      } else if (status === 403) {
        setError('Access denied by server. Check backend CORS/security settings.');
      } else if (status === 400) {
        setError(`Invalid input: ${backendMessage}`);
      } else if (!axiosErr.response) {
        setError('Cannot reach backend. Check API URL and ensure phone and backend are on same network.');
      } else {
        setError(`Registration failed (${status ?? 'unknown'}): ${backendMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Create account</Text>
      <TextInput
        label="Username"
        mode="outlined"
        autoCapitalize="none"
        autoComplete="username"
        textContentType={Platform.OS === 'ios' ? 'username' : 'none'}
        nativeID={`${idPrefix}-register-username`}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        autoComplete="new-password"
        textContentType={Platform.OS === 'ios' ? 'newPassword' : 'none'}
        nativeID={`${idPrefix}-register-password`}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        label="Confirm Password"
        mode="outlined"
        secureTextEntry
        autoComplete="new-password"
        textContentType={Platform.OS === 'ios' ? 'newPassword' : 'none'}
        nativeID={`${idPrefix}-register-confirm-password`}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
      <HelperText type="info" visible={Boolean(successMessage)}>
        {successMessage}
      </HelperText>
      <Pressable
        onPress={() => void onRegister()}
        disabled={loading}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
      >
        <Text style={styles.primaryButtonText}>{loading ? 'Loading...' : 'Register'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Login')} disabled={loading}>
        <Text style={styles.secondaryButtonText}>Back to login</Text>
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

export default RegisterScreen;
