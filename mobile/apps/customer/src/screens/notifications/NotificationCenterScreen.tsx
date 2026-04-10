import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const NotificationCenterScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Notification Centre</Text>
      <Text variant="bodyLarge">Customer reminders and announcement inbox.</Text>
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

export default NotificationCenterScreen;
