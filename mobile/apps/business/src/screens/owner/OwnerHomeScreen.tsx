import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OwnerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OwnerStackParamList, 'OwnerHome'>;

const OwnerHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium">Owner Workspace</Text>
          <Text variant="bodyLarge">Dashboard, reports, and staff management.</Text>
        </Card.Content>
        <View style={styles.actions}>
          <Button mode="contained" contentStyle={styles.buttonContent} onPress={() => navigation.navigate('Dashboard')}>
            Dashboard
          </Button>
          <Button mode="outlined" contentStyle={styles.buttonContent} onPress={() => navigation.navigate('Reports')}>
            Reports
          </Button>
          <Button
            mode="outlined"
            contentStyle={styles.buttonContent}
            onPress={() => navigation.navigate('StaffManagement')}
          >
            Staff Management
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    gap: 12,
  },
  content: {
    gap: 8,
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  buttonContent: {
    height: 48,
  },
});

export default OwnerHomeScreen;
