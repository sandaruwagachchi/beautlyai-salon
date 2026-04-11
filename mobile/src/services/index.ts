/**
 * Services Barrel Export
 */

export { default as apiClient } from './api';
export { default as authService } from './auth';
export type { LoginRequest, AuthResponse } from './auth';
export {
	default as notificationService,
	useNotifications,
	type Appointment,
	type NotificationSubscriptionState,
} from './NotificationService';

