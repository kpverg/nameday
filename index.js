/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry, Linking } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.ACTION_PRESS && (pressAction.id === 'call' || pressAction.id === 'sms')) {
    const phoneNumber = notification?.data?.phoneNumber;
    if (phoneNumber) {
      const url = pressAction.id === 'call' ? `tel:${phoneNumber}` : `sms:${phoneNumber}`;
      Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
    }
    
    // Remove the notification
    await notifee.cancelNotification(notification.id);
  }
});

AppRegistry.registerComponent(appName, () => App);
