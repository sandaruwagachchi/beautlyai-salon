/**
 * Application Configuration Constants
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const APP_CONFIG = {
  APP_NAME: 'BeautlyAI',
  APP_VERSION: '1.0.0',
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

