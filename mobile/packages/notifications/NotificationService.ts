import * as Notifications from 'expo-notifications';

export class NotificationService {
  async requestPermissions(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  async scheduleLocalNotification(title: string, body: string): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }
}

export const notificationService = new NotificationService();
