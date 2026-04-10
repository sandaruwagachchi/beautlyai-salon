import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>;

const CustomerHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">BeautlyAI</Text>
      <Text variant="bodyLarge">Your customer dashboard for bookings, rewards, and reminders.</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Start a booking</Text>
          <Text variant="bodyMedium">Pick a service and choose your time slot.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.getParent()?.navigate('Booking')}>
            Book now
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Rewards</Text>
          <Text variant="bodyMedium">See your loyalty points and tier progress.</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Loyalty')}>View rewards</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Upcoming appointment</Text>
          <Text variant="bodyMedium">Check your next booking status and reminders.</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('UpcomingAppointments')}>See appointment</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#FCFAF7' },
  card: { backgroundColor: '#FFFFFF' },
});

export default CustomerHomeScreen;
