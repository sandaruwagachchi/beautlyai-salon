export const BOOKING_TEXT = {
  customerHomeTitle: 'Book Your Next Appointment',
  customerHomeSubtitle: 'Start by selecting a service and your preferred time.',
  customerHomeStartButton: 'Start Booking',
  customerHomeNavTitle: 'Home',
  generalCategoryName: 'General',
  serviceSelectionTitle: 'Choose a Service',
  serviceSelectionSubtitle: 'Select one service to continue your booking.',
  servicePriceLabel: 'Price',
  serviceDurationLabel: 'Duration',
  serviceDurationMinutesSuffix: 'min',
  serviceSelectButton: 'Select Service',
  noServicesFound: 'No services are available right now.',
  dateTimeSelectionTitle: 'Choose Date and Time',
  dateTimeSelectionSubtitle: 'Pick a date and available time slot for your appointment.',
  weeklyPickerLabel: 'This Week',
  availableSlotsLabel: 'Available Time Slots',
  unavailableSlotLabel: 'Unavailable',
  selectDateFirst: 'Please select a date first.',
  selectTimeFirst: 'Please select a time slot to continue.',
  continueButton: 'Continue',
  bookingConfirmTitle: 'Confirm Booking',
  bookingConfirmSubtitle: 'Review your booking details before confirming.',
  bookingServiceLabel: 'Service',
  bookingDateLabel: 'Date',
  bookingTimeLabel: 'Time',
  confirmBookingButton: 'Confirm Booking',
  bookingSuccessTitle: 'Booking Confirmed',
  bookingSuccessSubtitle: 'Your appointment has been created successfully.',
  bookingSuccessAction: 'Back To Home',
  loadingServices: 'Loading services...',
  loadingAvailability: 'Loading availability...',
  creatingBooking: 'Creating booking...',
  retryAction: 'Retry',
  dismissAction: 'Dismiss',
  genericLoadError: 'Something went wrong while loading data.',
  genericBookingError: 'Unable to create booking. Please try again.',
} as const;

export const BOOKING_QUERY_KEYS = {
  services: ['public-services'] as const,
  availability: (serviceId: string, date: string) => ['availability', serviceId, date] as const,
} as const;

export const BOOKING_ENDPOINTS = {
  services: '/public/services',
  availability: '/public/availability',
  appointments: '/appointments',
} as const;

export const BOOKING_UI = {
  weeklyDaysToShow: 7,
  currency: 'USD',
  locale: 'en-US',
} as const;
