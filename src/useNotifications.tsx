import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import NotificationService from './services/NotificationService';
import { useAppContext } from './AppContext';
import { useContacts } from './ContactsContext';
import {
  findNamedayLocal,
} from './services/namedayService';
import {
  getMyPeopleCelebratingOnDate,
  formatMyPersonCelebration,
} from './services/myPeopleCelebrationService';
import type { Fest } from './types/fest';
import type { WorldDay } from './services/apiservices/worldday';
import type { Saint } from './types/saint';

export const useNotifications = (
  remoteFests?: Fest[],
  remoteWorldDays?: WorldDay[],
  remoteSaints?: Saint[],
) => {
  const { notificationsEnabled, globalDaysEnabled } = useAppContext();
  const { getContactsForNameday, getMyPeopleForNameday, myPeople } = useContacts();

  const getTodaysCelebrations = useCallback(() => {
    const today = new Date();
    const entry = findNamedayLocal(today);
    
    // Remote data merging
const dbNames = remoteFests?.[0]?.names ? (remoteFests[0].names as string).split(',').map(n => n.trim()) : [];
    const dbCelebs = remoteFests?.[0]?.celebrations ? (remoteFests[0].celebrations as string).split(',').map(c => c.trim()) : [];
    
    const names = dbNames.length > 0 ? dbNames : (entry?.names || []);
    const celebrations = dbCelebs.length > 0 ? dbCelebs : (entry?.celebrations || []);

    // Get world days if enabled
    let worldDays: string[] = [];
    if (globalDaysEnabled) {
      if (remoteWorldDays && remoteWorldDays.length > 0) {
        worldDays = remoteWorldDays.map(w => w.title).filter(Boolean) as string[];
      }
    }

    // Get contacts celebrating
    const contactsCelebrating = getContactsForNameday(names);

    // Get my people celebrating (name match)
    const nameMatchMembers = getMyPeopleForNameday(names);
    // Get my people celebrating (specific date match)
    const customDateMembers = getMyPeopleCelebratingOnDate(today, myPeople);

    // Merge and remove duplicates by ID
    const allMyPeople = [...nameMatchMembers];
    customDateMembers.forEach(person => {
      if (!allMyPeople.find(p => p.id === person.id)) {
        allMyPeople.push(person);
      }
    });

    return {
      names,
      celebrations,
      worldDays,
      contactsCelebrating,
      myPeopleCelebrating: allMyPeople,
      saints: remoteSaints || [],
    };
  }, [globalDaysEnabled, getContactsForNameday, getMyPeopleForNameday, myPeople, remoteFests, remoteWorldDays, remoteSaints]);

  const scheduleDailyNotification = useCallback(() => {
    if (!notificationsEnabled) return;
    
    const data = getTodaysCelebrations();

    let titleLabel = '🎉 Σημερινές Γιορτές';
    let message = '';

    // Add celebrations
    if (data.celebrations.length > 0) {
      message += `Εορτές: ${data.celebrations.join(', ')}\n\n`;
    }

    // Add names (if no celebrations or just to be thorough)
    if (data.names.length > 0) {
      message += `Ονόματα: ${data.names.slice(0, 10).join(', ')}${
        data.names.length > 10 ? '...' : ''
      }\n\n`;
    }

    // World Days
    if (data.worldDays.length > 0) {
      message += `🌍 Παγκόσμιες: ${data.worldDays.join(', ')}\n\n`;
    }

    // Add contacts
    if (data.contactsCelebrating.length > 0) {
      const contactNames = data.contactsCelebrating
        .slice(0, 3)
        .map(c => c.displayName)
        .join(', ');
      message += `👥 Επαφές: ${contactNames}${
        data.contactsCelebrating.length > 3
          ? ` και ${data.contactsCelebrating.length - 3} ακόμα`
          : ''
      }\n\n`;
    }

    // Add my people celebrating
    if (data.myPeopleCelebrating.length > 0) {
      const memberNames = data.myPeopleCelebrating
        .slice(0, 3)
        .map((m: any) => formatMyPersonCelebration(m))
        .join(', ');
      message += `❤️ Δικοί μου: ${memberNames}${
        data.myPeopleCelebrating.length > 3
          ? ` και ${data.myPeopleCelebrating.length - 3} ακόμα`
          : ''
      }\n\n`;
    }

    // Saint info
    if (data.saints.length > 0) {
      const saintNames = data.saints.map(s => s.name).join(', ');
      message += `🙏 Ευλογία της ημέρας: ${saintNames}\n`;
      
      const firstSaint = data.saints[0];
      if (firstSaint.bio) {
        // Strip some markdown or long content if needed, but show a bit
        const bioSnippet = firstSaint.bio.length > 120 
          ? firstSaint.bio.substring(0, 117).replace(/\n/g, ' ') + '...' 
          : firstSaint.bio.replace(/\n/g, ' ');
        message += `${bioSnippet}\n`;
      }
    }

    message = message.trim();

    if (message) {
      // Find someone to call (prioritize My People, then Contacts)
      let personToCall: any = null;
      if (data.myPeopleCelebrating.length > 0) {
        personToCall = data.myPeopleCelebrating.find((p: any) => p.phoneNumber);
      }
      if (!personToCall && data.contactsCelebrating.length > 0) {
        personToCall = data.contactsCelebrating.find((c: any) => c.phoneNumbers && c.phoneNumbers.length > 0);
      }

      const actions = [];
      const notificationData: any = {};

      if (personToCall) {
        const phone = personToCall.phoneNumber || (personToCall.phoneNumbers && personToCall.phoneNumbers[0].number);
        const name = personToCall.name || personToCall.displayName;
        if (phone) {
          notificationData.phoneNumber = phone;
          actions.push({
            title: `📞 Κλήση ${name.split(' ')[0]}`,
            pressAction: { id: 'call' },
          });
          actions.push({
            title: `💬 SMS ${name.split(' ')[0]}`,
            pressAction: { id: 'sms' },
          });
        }
      }

      // Schedule for 08:00 AM
      NotificationService.scheduleDailyNotification(
        'daily-0800',
        8,
        0,
        titleLabel,
        message,
        actions,
        notificationData
      );

      // Schedule for 15:00 PM
      NotificationService.scheduleDailyNotification(
        'daily-1500',
        15,
        0,
        titleLabel,
        message,
        actions,
        notificationData
      );
    }
  }, [notificationsEnabled, getTodaysCelebrations]);

  useEffect(() => {
    // Configure notifications
    NotificationService.configure();

    // Foreground event listener
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      const { notification, pressAction } = detail;

      if (
        type === EventType.ACTION_PRESS &&
        (pressAction?.id === 'call' || pressAction?.id === 'sms')
      ) {
        const phoneNumber = notification?.data?.phoneNumber;
        if (phoneNumber) {
          const url =
            pressAction.id === 'call'
              ? `tel:${phoneNumber}`
              : `sms:${phoneNumber}`;
          Linking.openURL(url).catch(err =>
            console.error('Error opening URL:', err),
          );
        }
        // Remove notification
        if (notification?.id) {
          notifee.cancelNotification(notification.id);
        }
      }
    });

    return () => unsubscribe();
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
