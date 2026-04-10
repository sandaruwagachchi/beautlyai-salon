import { BOOKING_ENDPOINTS, BOOKING_QUERY_KEYS, BOOKING_TEXT, BOOKING_UI } from './booking';

describe('booking constants', () => {
  it('keeps the customer booking text stable', () => {
    expect(BOOKING_TEXT.customerHomeTitle).toBe('Book Your Next Appointment');
    expect(BOOKING_TEXT.confirmBookingButton).toBe('Confirm Booking');
  });

  it('builds deterministic availability query keys', () => {
    expect(BOOKING_QUERY_KEYS.services).toEqual(['public-services']);
    expect(BOOKING_QUERY_KEYS.availability('service-1', '2026-04-10')).toEqual([
      'availability',
      'service-1',
      '2026-04-10',
    ]);
  });

  it('keeps API endpoint and UI defaults consistent', () => {
    expect(BOOKING_ENDPOINTS.appointments).toBe('/appointments');
    expect(BOOKING_UI.weeklyDaysToShow).toBe(7);
    expect(BOOKING_UI.locale).toBe('en-US');
  });
});

