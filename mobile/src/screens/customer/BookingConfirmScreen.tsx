import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Card, Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '../../services';
import type { CustomerStackParamList } from '../../navigation/types';
import { BOOKING_ENDPOINTS, BOOKING_TEXT, BOOKING_UI } from '../../constants/booking';
import type { AppointmentCreateResponse, CreateAppointmentRequest } from './bookingTypes';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookingConfirm'>;

const toDateTime = (selectedDate: string, startTime: string): string => {
  return `${selectedDate}T${startTime}:00`;
};

const formatDisplayDate = (selectedDate: string): string => {
  const date = new Date(`${selectedDate}T00:00:00`);
  return date.toLocaleDateString(BOOKING_UI.locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const BookingConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { service, selectedDate, selectedSlot } = route.params;
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
  const [showSuccessState, setShowSuccessState] = React.useState(false);
  const scaleAnimation = React.useRef(new Animated.Value(0.85)).current;
  const opacityAnimation = React.useRef(new Animated.Value(0)).current;

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateAppointmentRequest = {
        serviceId: service.id,
        startTime: toDateTime(selectedDate, selectedSlot.startTime),
      };
      return apiClient.post<AppointmentCreateResponse>(BOOKING_ENDPOINTS.appointments, payload);
    },
    onSuccess: () => {
      setShowSuccessState(true);
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    },
    onError: () => {
      setSnackbarMessage(BOOKING_TEXT.genericBookingError);
    },
  });

  const onConfirm = (): void => {
    bookingMutation.mutate();
  };

  if (showSuccessState) {
    return (
      <View style={styles.successContainer}>
        <Animated.View
          style={[
            styles.successAnimated,
            {
              opacity: opacityAnimation,
              transform: [{ scale: scaleAnimation }],
            },
          ]}
        >
          <Card>
            <Card.Content>
              <Text variant="headlineSmall">{BOOKING_TEXT.bookingSuccessTitle}</Text>
              <Text variant="bodyLarge" style={styles.successSubtitle}>
                {BOOKING_TEXT.bookingSuccessSubtitle}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={() => navigation.navigate('CustomerHome')}>
                {BOOKING_TEXT.bookingSuccessAction}
              </Button>
            </Card.Actions>
          </Card>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{BOOKING_TEXT.bookingConfirmTitle}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {BOOKING_TEXT.bookingConfirmSubtitle}
      </Text>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium">{BOOKING_TEXT.bookingServiceLabel}</Text>
          <Text variant="bodyLarge">{service.name}</Text>
          <Text variant="bodyMedium" style={styles.spacerLine}>
            {service.durationMinutes} {BOOKING_TEXT.serviceDurationMinutesSuffix}
          </Text>

          <Text variant="titleMedium" style={styles.sectionLabel}>
            {BOOKING_TEXT.bookingDateLabel}
          </Text>
          <Text variant="bodyLarge">{formatDisplayDate(selectedDate)}</Text>

          <Text variant="titleMedium" style={styles.sectionLabel}>
            {BOOKING_TEXT.bookingTimeLabel}
          </Text>
          <Text variant="bodyLarge">
            {selectedSlot.startTime} - {selectedSlot.endTime}
          </Text>
        </Card.Content>
      </Card>

      {bookingMutation.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            {BOOKING_TEXT.creatingBooking}
          </Text>
        </View>
      ) : null}

      <Button mode="contained" onPress={onConfirm} disabled={bookingMutation.isPending}>
        {BOOKING_TEXT.confirmBookingButton}
      </Button>

      <Snackbar
        visible={Boolean(snackbarMessage)}
        onDismiss={() => setSnackbarMessage('')}
        action={{
          label: BOOKING_TEXT.dismissAction,
          onPress: () => setSnackbarMessage(''),
        }}
      >
        {snackbarMessage}
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
    marginBottom: 16,
    opacity: 0.75,
  },
  summaryCard: {
    marginBottom: 20,
  },
  spacerLine: {
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  successAnimated: {
    width: '100%',
  },
  successSubtitle: {
    marginTop: 8,
  },
});

export default BookingConfirmScreen;
