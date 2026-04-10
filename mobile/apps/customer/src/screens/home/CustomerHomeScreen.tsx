import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const CustomerHomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">BeautlyAI</Text>
      <Text variant="bodyLarge">Dashboard, loyalty, and upcoming appointments.</Text>
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

export default CustomerHomeScreen;
