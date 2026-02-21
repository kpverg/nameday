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
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_PEOPLE);
      console.log(
        '[ContactsContext] Loading My People from storage:',
        stored ? 'found' : 'empty',
      );
      if (stored) {
        const groups = JSON.parse(stored);
        console.log('[ContactsContext] Parsed groups:', groups.length);
        const allMembers: MyPerson[] = [];

        groups.forEach((group: any) => {
          console.log(
            '[ContactsContext] Processing group:',
            group.name,
            'with',
            group.members?.length,
            'members',
          );
          group.members.forEach((member: any) => {
            allMembers.push({
              ...member,
              groupName: group.name,
              assocName: group.assocName,
              isFromMyPeople: true,
              phoneNumber: group.contactPhoneNumber || null,
            });
          });
        });

        console.log(
          '[ContactsContext] Total My People loaded:',
          allMembers.length,
        );
        setMyPeople(allMembers);
      } else {
        setMyPeople([]);
      }
    } catch (error) {
      console.error('Error loading My People:', error);
    }
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
      setContacts(
        allContacts.map(c => {
          const givenName = c.givenName || '';
          return {
            recordID: c.recordID,
            givenName: givenName,
            familyName: c.familyName || '',
            displayName: c.displayName || givenName || '',
            phoneNumbers: c.phoneNumbers || [],
            givenNameGreeklish: greekToGreeklish(givenName),
          };
        }),
      );
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const getContactsForNameday = (names: string[]): Contact[] => {
    if (!names || names.length === 0) return [];

    // Pre-calculate greeklish for all nameday names
    const namedayGreeklish = names.map(name => ({
      original: name,
      greeklish: greekToGreeklish(name),
    }));

    return contacts.filter(contact => {
      const givenName = contact.givenName;

      return namedayGreeklish.some(nameday =>
        namesMatch(givenName, nameday.original),
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

    const normalizedQuery = normalizeGreekName(greeklishToGreek(query));
    if (!normalizedQuery) return [];

    return contacts.filter(contact => {
      const normalizedGivenName = normalizeGreekName(contact.givenName);
      const normalizedFamilyName = normalizeGreekName(contact.familyName);
      const normalizedDisplayName = normalizeGreekName(contact.displayName);

      // Exact match
      if (
        normalizedGivenName === normalizedQuery ||
        normalizedFamilyName === normalizedQuery ||
        normalizedDisplayName === normalizedQuery
      ) {
        return true;
      }

      // Word-level and prefix matching
      const queryWords = normalizedQuery.split(/\s+/);
      const nameWords = [
        ...normalizedGivenName.split(/\s+/),
        ...normalizedFamilyName.split(/\s+/),
      ];

      return queryWords.some(qWord =>
        nameWords.some(
          nWord =>
            nWord === qWord ||
            (qWord.length >= 3 && nWord.startsWith(qWord)) ||
            (nWord.length >= 3 && qWord.startsWith(nWord)),
        ),
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
