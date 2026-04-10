import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirm'>;

const BookingConfirmScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Confirm Booking</Text>
          <Text variant="bodyMedium">Review details and confirm your appointment request.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={() => navigation.navigate('ServiceSelection')}>
            New Booking
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FCFAF7' },
  card: { backgroundColor: '#FFFFFF' },
});

export default BookingConfirmScreen;
