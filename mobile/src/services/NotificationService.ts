import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import apiClient from './api';

export interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  startTime: string;
}

interface RegisterDevicePayload {
  deviceToken: string;
  deviceType: 'ios' | 'android' | 'web';
  environment: string;
}

export interface NotificationSubscriptionState {
  notification: Notifications.Notification | null;
  response: Notifications.NotificationResponse | null;
}

class NotificationService {
  private foregroundSubscription: Notifications.EventSubscription | null = null;
  private responseSubscription: Notifications.EventSubscription | null = null;
  private isInitialized = false;

  async initialize(): Promise<string | null> {
    this.setForegroundHandler();
    this.attachAppLevelListeners();

    const permissionStatus = await this.requestPermissions();
    if (permissionStatus !== 'granted') {
      return null;
    }

    return this.registerDevicePushToken();
  }

  async requestPermissions(): Promise<Notifications.PermissionStatus> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') {
      return existingStatus;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  async registerDevicePushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      const token = tokenResponse.data;

      const payload: RegisterDevicePayload = {
        deviceToken: token,
        deviceType: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
        environment: process.env.EXPO_PUBLIC_ENV ?? 'local',
      };

      await apiClient.post('/devices/register', payload);
      return token;
    } catch (error) {
      console.error('Failed to register device push token:', error);
      return null;
    }
  }

  async scheduleNextAppointmentReminder(appointment: Appointment): Promise<string[]> {
    const appointmentDate = new Date(appointment.startTime);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw new Error('Invalid appointment startTime. Expected an ISO date string.');
    }

    const reminderOffsets = [24 * 60 * 60 * 1000, 2 * 60 * 60 * 1000];
    const now = Date.now();
    const scheduledIds: string[] = [];

    for (const offset of reminderOffsets) {
      const triggerDate = new Date(appointmentDate.getTime() - offset);
      if (triggerDate.getTime() <= now) {
        continue;
      }

      const hoursBefore = offset / (60 * 60 * 1000);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming appointment reminder',
          body: `${appointment.clientName} - ${appointment.serviceName} starts in ${hoursBefore} hours.`,
          data: {
            appointmentId: appointment.id,
            reminderHoursBefore: hoursBefore,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      scheduledIds.push(notificationId);
    }

    return scheduledIds;
  }

  subscribe(
    onNotification: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const notificationSubscription = Notifications.addNotificationReceivedListener(onNotification);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (onResponse) {
        onResponse(response);
      }
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }

  private setForegroundHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  private attachAppLevelListeners(): void {
    if (this.isInitialized) {
      return;
    }

    this.foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification received:', notification.request.identifier);
    });

    this.responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Background notification response:', response.notification.request.identifier);
    });

    this.isInitialized = true;
  }
}

export const notificationService = new NotificationService();

export function useNotifications(): NotificationSubscriptionState {
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [response, setResponse] = useState<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    void notificationService.initialize();
    const unsubscribe = notificationService.subscribe(setNotification, setResponse);
    return unsubscribe;
  }, []);

  return { notification, response };
}

export default notificationService;