import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const StaffHomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Staff Workspace</Text>
      <Text variant="bodyLarge">Schedule, clients, and checkout.</Text>
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

export default StaffHomeScreen;
