import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import {
  PermissionsAndroid,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  greekToGreeklish,
  greeklishToGreek,
  normalizeGreekName,
  namesMatch,
} from './utils/greekUtils';
import { STORAGE_KEYS } from './services/localPaths';

interface Contact {
  recordID: string;
  givenName: string;
  familyName: string;
  displayName: string;
  phoneNumbers: { label: string; number: string }[];
  givenNameGreeklish?: string;
}

interface MyPerson {
  id: string;
  name: string;
  relation: string;
  birthday: string | null;
  groupName?: string;
  isFromMyPeople?: boolean;
  phoneNumber?: string | null;
}

interface ContactsContextType {
  contacts: Contact[];
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getContactsForNameday: (names: string[]) => Contact[];
  getMyPeopleForNameday: (names: string[]) => MyPerson[];
  searchContactsByGreeklish: (query: string) => Contact[];
  refreshContacts: () => Promise<void>;
  refreshMyPeople: () => Promise<void>;
  myPeople: MyPerson[];
}

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined,
);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [myPeople, setMyPeople] = useState<MyPerson[]>([]);

  // Load My People groups and extract members
  const loadMyPeople = async () => {
    await loadMyPeopleInternal(contacts);
  };

  // Listen for storage changes
  useEffect(() => {
    // Load immediately on mount
    loadMyPeople();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Άδεια Πρόσβασης στις Επαφές',
            message:
              'Η εφαρμογή χρειάζεται πρόσβαση στις επαφές σας για να σας εμφανίσει ποιοι γιορτάζουν.',
            buttonPositive: 'Αποδοχή',
            buttonNegative: 'Άρνηση',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          await loadContacts();
          return true;
        }
        return false;
      } else if (Platform.OS === 'ios') {
        const permission = await Contacts.requestPermission();
        if (permission === 'authorized') {
          setHasPermission(true);
          await loadContacts();
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  };

  const loadContacts = async () => {
    try {
      const allContacts = await Contacts.getAll();
      const mappedContacts = allContacts.map(c => {
        const givenName = c.givenName || '';
        return {
          recordID: c.recordID,
          givenName: givenName,
          familyName: c.familyName || '',
          displayName: c.displayName || givenName || '',
          phoneNumbers: c.phoneNumbers || [],
          givenNameGreeklish: greekToGreeklish(givenName),
        };
      });
      setContacts(mappedContacts);
      // Trigger reloading My People to ensure correct phone numbers from contacts
      await loadMyPeopleInternal(mappedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadMyPeopleInternal = async (currentContacts: Contact[]) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_PEOPLE);
      if (stored) {
        const groups = JSON.parse(stored);
        const allMembers: MyPerson[] = [];

        groups.forEach((group: any) => {
          group.members.forEach((member: any) => {
            // Find contact from recordID stored in group if available
            let associatedContact = group.contactRecordID 
              ? currentContacts.find((c: any) => c.recordID === group.contactRecordID)
              : null;
            
            // Fallback for older data: Try to find by name if we have an assocName
            if (!associatedContact && group.assocName) {
              const normalizedAssoc = group.assocName.trim().toLowerCase();
              associatedContact = currentContacts.find((c: any) => {
                const displayName = (c.displayName || '').toLowerCase();
                const fullName = `${c.givenName || ''} ${c.familyName || ''}`.trim().toLowerCase();
                return displayName === normalizedAssoc || fullName === normalizedAssoc;
              });
            }
            
            const phoneNumber = associatedContact?.phoneNumbers?.[0]?.number 
              || group.contactPhoneNumber 
              || member.phoneNumber 
              || null;

            allMembers.push({
              ...member,
              groupName: group.name,
              assocName: group.assocName,
              isFromMyPeople: true,
              phoneNumber: phoneNumber,
            });
          });
        });
        setMyPeople(allMembers);
      }
    } catch (error) {
      console.error('Error in loadMyPeopleInternal:', error);
    }
  };

  const getContactsForNameday = (names: string[]): Contact[] => {
    if (!names || names.length === 0) return [];

    return contacts.filter(contact => {
      return names.some(namedayName => 
        namesMatch(contact.givenName, namedayName) ||
        namesMatch(contact.familyName, namedayName) ||
        namesMatch(contact.displayName, namedayName)
      );
    });
  };

  const getMyPeopleForNameday = (names: string[]): MyPerson[] => {
    if (!names || names.length === 0) return [];

    console.log(
      '[ContactsContext] getMyPeopleForNameday called with names:',
      names,
    );
    console.log('[ContactsContext] Total myPeople available:', myPeople.length);

    const matching = myPeople.filter(member => {
      const matches = names.some(namedayName => {
        const result = namesMatch(member.name, namedayName);
        if (result) {
          console.log(
            '[ContactsContext] Match found:',
            member.name,
            'matches',
            namedayName,
          );
        }
        return result;
      });
      return matches;
    });

    console.log('[ContactsContext] Matching my people:', matching.length);
    return matching;
  };

  const searchContactsByGreeklish = (query: string): Contact[] => {
    if (!query.trim()) return [];

    return contacts.filter(contact => {
      // Use the same namesMatch logic for consistency
      return (
        namesMatch(contact.displayName, query) ||
        namesMatch(contact.givenName, query) ||
        namesMatch(contact.familyName, query)
      );
    });
  };

  const handleAppStateChange = async (state: AppStateStatus) => {
    // Refresh contacts when app comes to foreground
    if (state === 'active' && hasPermission) {
      await loadContacts();
    }
  };

  useEffect(() => {
    // Check if we already have permission
    const checkPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          );
          if (granted) {
            setHasPermission(true);
            await loadContacts();
          }
        } else if (Platform.OS === 'ios') {
          const permission = await Contacts.checkPermission();
          if (permission === 'authorized') {
            setHasPermission(true);
            await loadContacts();
          }
        }
      } catch (error) {
        console.error('Error checking permission:', error);
      }
    };

    checkPermission();

    // Listen for app state changes (foreground/background)
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  const refreshContacts = async () => {
    if (hasPermission) {
      await loadContacts();
    }
  };

  const refreshMyPeople = async () => {
    await loadMyPeople();
  };

  const value: ContactsContextType = {
    contacts,
    hasPermission,
    requestPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    searchContactsByGreeklish,
    refreshContacts,
    refreshMyPeople,
    myPeople,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within ContactsProvider');
  }
  return context;
};
