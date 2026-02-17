import notifee from '@notifee/react-native';
import {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  channelId = 'nameday-channel';

  configure = async () => {
    // Create channel for Android
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Nameday Notifications',
        description: 'Ειδοποιήσεις για γιορτές',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }

    // Request permission
    await notifee.requestPermission();
  };

  requestPermission = async () => {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  };

  scheduleNotification = async (
    title: string,
    message: string,
    date: Date,
    id?: string,
  ) => {
    await notifee.createTriggerNotification(
      {
        id: id || `notif-${Date.now()}`,
        title: title,
        body: message,
        android: {
          channelId: this.channelId,
          sound: 'default',
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
      },
    );
  };

  scheduleDailyNotification = async (
    hour: number,
    minute: number,
    title: string,
    message: string,
  ) => {
    const now = new Date();
    const notificationDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0,
      0,
    );

    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    await notifee.createTriggerNotification(
      {
        id: 'daily-nameday',
        title: title,
        body: message,
        android: {
          channelId: this.channelId,
          sound: 'default',
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: notificationDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  };

  cancelAllNotifications = async () => {
    await notifee.cancelAllNotifications();
  };

  cancelNotification = async (id: string) => {
    await notifee.cancelNotification(id);
  };
}

export default new NotificationService();
