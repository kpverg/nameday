import { useEffect, useCallback } from 'react';
import NotificationService from './services/NotificationService';
import { useAppContext } from './AppContext';
import { useContacts } from './ContactsContext';
import {
  findNamedayLocal,
  findWorldDayLocal,
} from './services/namedayService';

export const useNotifications = () => {
  const { notificationsEnabled, globalDaysEnabled } = useAppContext();
  const { getContactsForNameday, getMyPeopleForNameday } = useContacts();

  const getTodaysCelebrations = useCallback(() => {
    const today = new Date();
    const entry = findNamedayLocal(today);
    const names = entry?.names || [];
    const celebrations = entry?.celebrations || [];

    // Get world days if enabled
    let worldDays: string[] = [];
    if (globalDaysEnabled) {
      const wd = findWorldDayLocal(today);
      if (wd) worldDays = [wd];
    }

    // Get contacts celebrating
    const contactsCelebrating = getContactsForNameday(names);

    // Get my people celebrating
    const myPeopleCelebrating = getMyPeopleForNameday(names);

    return {
      names,
      celebrations,
      worldDays,
      contactsCelebrating,
      myPeopleCelebrating,
    };
  }, [globalDaysEnabled, getContactsForNameday, getMyPeopleForNameday]);

  const scheduleDailyNotification = useCallback(() => {
    const data = getTodaysCelebrations();

    let title = '🎉 Σημερινές Γιορτές';
    let message = '';

    // Add celebrations
    if (data.celebrations.length > 0) {
      message += `Γιορτάζουν: ${data.celebrations.join(', ')}\n`;
    }

    // Add names
    if (data.names.length > 0) {
      message += `Ονόματα: ${data.names.slice(0, 5).join(', ')}${
        data.names.length > 5 ? '...' : ''
      }\n`;
    }

    // Add contacts
    if (data.contactsCelebrating.length > 0) {
      const contactNames = data.contactsCelebrating
        .slice(0, 3)
        .map(c => c.displayName)
        .join(', ');
      message += `Επαφές: ${contactNames}${
        data.contactsCelebrating.length > 3
          ? ` και ${data.contactsCelebrating.length - 3} ακόμα`
          : ''
      }\n`;
    }

    // Add my people celebrating
    if (data.myPeopleCelebrating.length > 0) {
      const memberNames = data.myPeopleCelebrating
        .slice(0, 3)
        .map((m: any) => m.name)
        .join(', ');
      message += `Δικοί μου άνθρωποι: ${memberNames}${
        data.myPeopleCelebrating.length > 3
          ? ` και ${data.myPeopleCelebrating.length - 3} ακόμα`
          : ''
      }`;
    }

    if (message) {
      // Schedule for 8:00 AM every day
      NotificationService.scheduleDailyNotification(
        8,
        0,
        title,
        message.trim(),
      );
    }
  }, [getTodaysCelebrations]);

  useEffect(() => {
    // Configure notifications
    NotificationService.configure();
  }, []);

  useEffect(() => {
    if (notificationsEnabled) {
      scheduleDailyNotification();
    } else {
      NotificationService.cancelAllNotifications();
    }
  }, [notificationsEnabled, scheduleDailyNotification]);

  return {
    scheduleDailyNotification,
  };
};
