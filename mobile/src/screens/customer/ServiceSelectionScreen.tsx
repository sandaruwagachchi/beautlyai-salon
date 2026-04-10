import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '../../services';
import type { CustomerStackParamList } from '../../navigation/types';
import {
  BOOKING_ENDPOINTS,
  BOOKING_QUERY_KEYS,
  BOOKING_TEXT,
  BOOKING_UI,
} from '../../constants/booking';
import type { Service, ServiceCategoryGroup } from './bookingTypes';

type Props = NativeStackScreenProps<CustomerStackParamList, 'ServiceSelection'>;

type ServicesApiResponse =
  | Service[]
  | {
      services?: Service[];
      categories?: Array<{
        categoryName: string;
        services: Service[];
      }>;
    };

const toCurrency = (value: number): string => {
  return new Intl.NumberFormat(BOOKING_UI.locale, {
    style: 'currency',
    currency: BOOKING_UI.currency,
  }).format(value);
};

const normalizeServices = (data: ServicesApiResponse): ServiceCategoryGroup[] => {
  let services: Service[] = [];

  if (Array.isArray(data)) {
    services = data;
  } else if (data.categories && Array.isArray(data.categories)) {
    return data.categories.map((category) => ({
      categoryName: category.categoryName,
      services: category.services,
    }));
  } else if (data.services && Array.isArray(data.services)) {
    services = data.services;
  }

  const grouped = services.reduce<Record<string, Service[]>>((accumulator, service) => {
    const key = service.categoryName || BOOKING_TEXT.generalCategoryName;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(service);
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([categoryName, groupedServices]) => ({
    categoryName,
    services: groupedServices,
  }));
};

const ServiceSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

  const servicesQuery = useQuery({
    queryKey: BOOKING_QUERY_KEYS.services,
    queryFn: () => apiClient.get<ServicesApiResponse>(BOOKING_ENDPOINTS.services),
  });

  const groupedServices = servicesQuery.data ? normalizeServices(servicesQuery.data) : [];

  const onRetry = (): void => {
    servicesQuery.refetch();
    setSnackbarVisible(false);
  };

  const onSelectService = (service: Service): void => {
    navigation.navigate('DateTimeSelection', { service });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{BOOKING_TEXT.serviceSelectionTitle}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {BOOKING_TEXT.serviceSelectionSubtitle}
      </Text>

      {servicesQuery.isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            {BOOKING_TEXT.loadingServices}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {groupedServices.map((category) => (
            <View key={category.categoryName} style={styles.categorySection}>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                {category.categoryName}
              </Text>
              {category.services.map((service) => (
                <Card key={service.id} style={styles.card}>
                  <Card.Content>
                    <Text variant="titleMedium">{service.name}</Text>
                    <Text variant="bodyMedium" style={styles.metaText}>
                      {BOOKING_TEXT.servicePriceLabel}: {toCurrency(service.price)}
                    </Text>
                    <Text variant="bodyMedium" style={styles.metaText}>
                      {BOOKING_TEXT.serviceDurationLabel}: {service.durationMinutes}{' '}
                      {BOOKING_TEXT.serviceDurationMinutesSuffix}
                    </Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button mode="contained" onPress={() => onSelectService(service)}>
                      {BOOKING_TEXT.serviceSelectButton}
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
            </View>
          ))}

          {!groupedServices.length && !servicesQuery.isError ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="bodyLarge">{BOOKING_TEXT.noServicesFound}</Text>
              </Card.Content>
            </Card>
          ) : null}
        </ScrollView>
      )}

      <Snackbar
        visible={snackbarVisible || servicesQuery.isError}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: BOOKING_TEXT.retryAction,
          onPress: onRetry,
        }}
      >
        {BOOKING_TEXT.genericLoadError}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    opacity: 0.75,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryTitle: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 10,
  },
  metaText: {
    marginTop: 4,
    opacity: 0.8,
  },
});

export default ServiceSelectionScreen;
