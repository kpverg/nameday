import { useEffect } from 'react';
import { Datanames } from '../data/datanames';
import { getMovableNamedayEntries } from '../data/movingCelebrations';
import { worldDaysJanFeb } from '../data/worldday';
import NotificationService from './NotificationService';
import { useAppContext } from './AppContext';
import { useContacts } from './ContactsContext';

const GREEK_MONTHS = [
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος',
];

export const useNotifications = () => {
  const { notificationsEnabled, globalDaysEnabled } = useAppContext();
  const { getContactsForNameday, getSchemaMembersForNameday } = useContacts();

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
  }, [notificationsEnabled]);

  const getTodaysCelebrations = () => {
    const today = new Date();
    const day = today.getDate();
    const monthIndex = today.getMonth();
    const year = today.getFullYear();
    const monthName = GREEK_MONTHS[monthIndex];

    // Get names from Datanames
    const entry = Datanames.find(e => e.day === day && e.month === monthName);
    const names = entry?.names || [];
    const celebrations = entry?.celebrations || [];

    // Get movable feasts
    const movableEntries = getMovableNamedayEntries(year);
    const todayMovable = movableEntries.find(
      e => e.day === day && e.month === monthName,
    );
    if (todayMovable) {
      celebrations.push(...todayMovable.celebrations);
    }

    // Get world days if enabled
    let worldDays: string[] = [];
    if (globalDaysEnabled) {
      const todayDate = `${day} ${monthName}`;
      const worldEntry = worldDaysJanFeb.find(e => e.date === todayDate);
      if (worldEntry) {
        worldDays = [worldEntry.title];
      }
    }

    // Get contacts celebrating
    const contactsCelebrating = getContactsForNameday(names);

    // Get schema members celebrating
    const schemaMembersCelebrating = getSchemaMembersForNameday(names);

    return {
      names,
      celebrations,
      worldDays,
      contactsCelebrating,
      schemaMembersCelebrating,
    };
  };

  const scheduleDailyNotification = () => {
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

    // Add schema members
    if (data.schemaMembersCelebrating.length > 0) {
      const memberNames = data.schemaMembersCelebrating
        .slice(0, 3)
        .map(m => m.name)
        .join(', ');
      message += `Μέλη σχημάτων: ${memberNames}${
        data.schemaMembersCelebrating.length > 3
          ? ` και ${data.schemaMembersCelebrating.length - 3} ακόμα`
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
  };

  return {
    scheduleDailyNotification,
  };
};
