import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AvailabilitySlot, Service } from '../screens/customer/bookingTypes';

export type CustomerStackParamList = {
  CustomerHome: undefined;
  ServiceSelection: undefined;
  DateTimeSelection: {
    service: Service;
  };
  BookingConfirm: {
    service: Service;
    selectedDate: string;
    selectedSlot: AvailabilitySlot;
  };
};

export type RootStackParamList = {
  Customer: NavigatorScreenParams<CustomerStackParamList>;
};
