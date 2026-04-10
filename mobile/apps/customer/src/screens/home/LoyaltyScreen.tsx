import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const LoyaltyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall">Loyalty</Text>
          <Text variant="bodyMedium">Track points, rewards, and member tier progress.</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default LoyaltyScreen;
