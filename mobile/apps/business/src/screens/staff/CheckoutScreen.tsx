import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const CheckoutScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall">Checkout</Text>
          <Text variant="bodyMedium">Invoice, payment capture, and loyalty redemption.</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default CheckoutScreen;
