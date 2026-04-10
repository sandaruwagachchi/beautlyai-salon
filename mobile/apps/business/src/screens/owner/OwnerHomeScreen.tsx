import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const OwnerHomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Owner Workspace</Text>
      <Text variant="bodyLarge">Dashboard, reports, and staff management.</Text>
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

export default OwnerHomeScreen;
