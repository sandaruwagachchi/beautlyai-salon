/**
 * Login Screen
 * Authentication screen with email/password login
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, MD3DarkTheme } from 'react-native-paper';
import { authService } from '../../services';
import { useAuthStore } from '../../store';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [securePassword, setSecurePassword] = useState(true);

  const { setUser, setToken } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          BeautlyAI
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Salon Management System
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isLoading}
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={securePassword}
          right={
            <TextInput.Icon
              icon={securePassword ? 'eye-off' : 'eye'}
              onPress={() => setSecurePassword(!securePassword)}
            />
          }
          disabled={isLoading}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={isLoading}
          loading={isLoading}
          style={styles.button}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  content: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen;

