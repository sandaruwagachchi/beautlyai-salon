import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const AdminHomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Admin Workspace</Text>
      <Text variant="bodyLarge">Platform overview, KYC, and audit logs.</Text>
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

export default AdminHomeScreen;
