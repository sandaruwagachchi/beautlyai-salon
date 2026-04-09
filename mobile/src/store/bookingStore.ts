/**
 * Booking Store
 * Global booking state management
 */

import { create } from 'zustand';

export interface Booking {
  id: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  selectBooking: (booking: Booking | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (booking) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === booking.id ? booking : b)),
    })),
  deleteBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== bookingId),
    })),
  selectBooking: (booking) => set({ selectedBooking: booking }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

