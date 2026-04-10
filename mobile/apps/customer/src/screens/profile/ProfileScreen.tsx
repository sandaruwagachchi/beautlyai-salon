import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Profile</Text>
      <Text variant="bodyLarge">Account, history, and preferences.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
});

export default ProfileScreen;
