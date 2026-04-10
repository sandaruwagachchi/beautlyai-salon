import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Account'>;

const AccountScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Account</Text>
          <Text variant="bodyMedium">Personal details, contact info, and linked sign-in methods.</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('History')}>View history</Button>
          <Button onPress={() => navigation.navigate('Preferences')}>Preferences</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FCFAF7' },
  card: { backgroundColor: '#FFFFFF' },
});

export default AccountScreen;
