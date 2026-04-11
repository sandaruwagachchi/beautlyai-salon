import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { tokenService, useAuthStore } from '@beautlyai/auth';

const LogoutHeaderButton: React.FC = () => {
  const { clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const performLogout = React.useCallback(async (): Promise<void> => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await tokenService.clear();
      clearAuth();

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.reload();
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [clearAuth, isLoggingOut]);

  const onPress = React.useCallback((): void => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  }, [performLogout]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoggingOut}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, isLoggingOut && styles.disabled]}
    >
      <Text style={styles.text}>{isLoggingOut ? '...' : 'Logout'}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  text: {
    color: '#6c4fb2',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default LogoutHeaderButton;
