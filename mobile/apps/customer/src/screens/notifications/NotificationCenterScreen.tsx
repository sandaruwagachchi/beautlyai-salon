import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NotificationStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<NotificationStackParamList, 'NotificationCenter'>;

const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Notification Centre</Text>
      <Text variant="bodyLarge">Customer reminders and announcement inbox.</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Upcoming booking reminder</Text>
          <Text variant="bodyMedium">Tomorrow at 10:30 AM - Hair cut & styling.</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.getParent()?.navigate('Booking')}>Reschedule</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#FCFAF7' },
  card: { backgroundColor: '#FFFFFF' },
});

export default NotificationCenterScreen;
