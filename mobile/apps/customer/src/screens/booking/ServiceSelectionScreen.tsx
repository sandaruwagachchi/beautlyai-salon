import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'ServiceSelection'>;

const ServiceSelectionScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall">Service Selection</Text>
          <Text variant="bodyMedium">Choose a service category and preferred treatment.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('DateTimeSelection')}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default ServiceSelectionScreen;
