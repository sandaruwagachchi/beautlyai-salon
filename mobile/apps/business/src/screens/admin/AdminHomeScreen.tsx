import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHome'>;

const AdminHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium">Admin Workspace</Text>
          <Text variant="bodyLarge">Platform overview, KYC, and audit logs.</Text>
        </Card.Content>
        <View style={styles.actions}>
          <Button mode="contained" contentStyle={styles.buttonContent} onPress={() => navigation.navigate('PlatformOverview')}>
            Platform Overview
          </Button>
          <Button mode="outlined" contentStyle={styles.buttonContent} onPress={() => navigation.navigate('KycReview')}>
            KYC Review
          </Button>
          <Button mode="text" contentStyle={styles.buttonContent} onPress={() => navigation.navigate('AuditLogs')}>
            Audit Logs
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

export default AdminHomeScreen;
