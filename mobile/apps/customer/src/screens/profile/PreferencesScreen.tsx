import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const PreferencesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall">Preferences</Text>
          <Text variant="bodyMedium">Notification, privacy, and accessibility settings.</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default PreferencesScreen;
