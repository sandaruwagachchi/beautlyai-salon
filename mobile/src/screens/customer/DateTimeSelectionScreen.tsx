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
import type { AvailabilitySlot } from './bookingTypes';

type Props = NativeStackScreenProps<CustomerStackParamList, 'DateTimeSelection'>;

type AvailabilityApiResponse =
  | AvailabilitySlot[]
  | {
      slots?: AvailabilitySlot[];
    };

const buildWeekDates = (): Date[] => {
  const today = new Date();
  return Array.from({ length: BOOKING_UI.weeklyDaysToShow }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() + index);
    return day;
  });
};

const formatDateParam = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateLabel = (date: Date): string => {
  return date.toLocaleDateString(BOOKING_UI.locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const normalizeSlots = (data: AvailabilityApiResponse): AvailabilitySlot[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.slots)) {
    return data.slots;
  }

  return [];
};

const DateTimeSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { service } = route.params;
  const weekDates = React.useMemo(() => buildWeekDates(), []);
  const [selectedDate, setSelectedDate] = React.useState<Date>(weekDates[0]);
  const [selectedSlot, setSelectedSlot] = React.useState<AvailabilitySlot | null>(null);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');

  const dateParam = formatDateParam(selectedDate);

  const availabilityQuery = useQuery({
    queryKey: BOOKING_QUERY_KEYS.availability(service.id, dateParam),
    queryFn: () =>
      apiClient.get<AvailabilityApiResponse>(BOOKING_ENDPOINTS.availability, {
        params: {
          serviceId: service.id,
          date: dateParam,
        },
      }),
  });

  const slots = availabilityQuery.data ? normalizeSlots(availabilityQuery.data) : [];

  const onContinue = (): void => {
    if (!selectedDate) {
      setSnackbarMessage(BOOKING_TEXT.selectDateFirst);
      return;
    }

    if (!selectedSlot || !selectedSlot.available) {
      setSnackbarMessage(BOOKING_TEXT.selectTimeFirst);
      return;
    }

    navigation.navigate('BookingConfirm', {
      service,
      selectedDate: dateParam,
      selectedSlot,
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{BOOKING_TEXT.dateTimeSelectionTitle}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {BOOKING_TEXT.dateTimeSelectionSubtitle}
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {BOOKING_TEXT.weeklyPickerLabel}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
        {weekDates.map((date) => {
          const isSelected = formatDateParam(date) === dateParam;
          return (
            <Card key={formatDateParam(date)} style={[styles.dateCard, isSelected && styles.dateCardSelected]}>
              <Card.Content>
                <Button mode={isSelected ? 'contained' : 'outlined'} onPress={() => setSelectedDate(date)}>
                  {formatDateLabel(date)}
                </Button>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {BOOKING_TEXT.availableSlotsLabel}
      </Text>

      {availabilityQuery.isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            {BOOKING_TEXT.loadingAvailability}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.slotList}>
          {slots.map((slot) => {
            const isSelected = selectedSlot?.startTime === slot.startTime;
            return (
              <Card
                key={`${slot.startTime}-${slot.endTime}`}
                style={[
                  styles.slotCard,
                  !slot.available && styles.slotCardUnavailable,
                  isSelected && styles.slotCardSelected,
                ]}
              >
                <Card.Content>
                  <Text variant="titleMedium">
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  {!slot.available ? (
                    <Text variant="bodySmall" style={styles.unavailableText}>
                      {BOOKING_TEXT.unavailableSlotLabel}
                    </Text>
                  ) : null}
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode={isSelected ? 'contained' : 'outlined'}
                    disabled={!slot.available}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    {slot.available ? BOOKING_TEXT.continueButton : BOOKING_TEXT.unavailableSlotLabel}
                  </Button>
                </Card.Actions>
              </Card>
            );
          })}
        </ScrollView>
      )}

      <Button mode="contained" onPress={onContinue} style={styles.continueButton}>
        {BOOKING_TEXT.continueButton}
      </Button>

      <Snackbar
        visible={Boolean(snackbarMessage) || availabilityQuery.isError}
        onDismiss={() => setSnackbarMessage('')}
        action={{
          label: availabilityQuery.isError ? BOOKING_TEXT.retryAction : BOOKING_TEXT.dismissAction,
          onPress: () => {
            if (availabilityQuery.isError) {
              availabilityQuery.refetch();
            }
            setSnackbarMessage('');
          },
        }}
      >
        {availabilityQuery.isError ? BOOKING_TEXT.genericLoadError : snackbarMessage}
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
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
  },
  weekRow: {
    paddingBottom: 4,
  },
  dateCard: {
    marginRight: 10,
    minWidth: 128,
  },
  dateCardSelected: {
    borderWidth: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  slotList: {
    paddingBottom: 90,
  },
  slotCard: {
    marginBottom: 10,
  },
  slotCardUnavailable: {
    backgroundColor: '#e0e0e0',
  },
  slotCardSelected: {
    borderWidth: 1,
  },
  unavailableText: {
    opacity: 0.75,
    marginTop: 4,
  },
  continueButton: {
    marginVertical: 12,
  },
});

export default DateTimeSelectionScreen;
