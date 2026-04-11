/**
 * Notification Service
 * Handles push notifications and in-app notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import apiClient from './api';

interface RegisterDeviceRequest {
  deviceToken: string;
  deviceType: 'ios' | 'android';
}

class NotificationService {
  async registerPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      // Register device token with backend
      const deviceType = Device.osName?.toLowerCase() === 'ios' ? 'ios' : 'android';
      await apiClient.post('/notifications/register-device', {
        deviceToken: token,
        deviceType,
      } as RegisterDeviceRequest);

      return token;
    } catch (error) {
      console.error('Failed to register push notifications:', error);
      return null;
    }
  }

  setNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });
  }

  addNotificationListener(callback: (notification: Notifications.Notification) => void): void {
    Notifications.addNotificationResponseReceivedListener((response) => {
      callback(response.notification);
    });
  }
}

export default new NotificationService();

