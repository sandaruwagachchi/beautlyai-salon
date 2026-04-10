import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const PlatformOverviewScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall">Platform Overview</Text>
          <Text variant="bodyMedium">Tenant growth, health status, and system-level KPIs.</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default PlatformOverviewScreen;
