import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const BookingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Booking</Text>
      <Text variant="bodyLarge">Service selection, date/time, and confirmation flow.</Text>
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

export default BookingScreen;
