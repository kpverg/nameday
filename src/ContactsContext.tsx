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

interface Contact {
  recordID: string;
  givenName: string;
  familyName: string;
  displayName: string;
  phoneNumbers: { label: string; number: string }[];
}

interface ContactsContextType {
  contacts: Contact[];
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getContactsForNameday: (names: string[]) => Contact[];
  searchContactsByGreeklish: (query: string) => Contact[];
  refreshContacts: () => Promise<void>;
}

// Greeklish to Greek conversion
const greeklishToGreek = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/th/g, 'θ')
    .replace(/ts/g, 'τς')
    .replace(/ch/g, 'χ')
    .replace(/ph/g, 'φ')
    .replace(/ou/g, 'ου')
    .replace(/a/g, 'α')
    .replace(/b/g, 'β')
    .replace(/g/g, 'γ')
    .replace(/d/g, 'δ')
    .replace(/e/g, 'ε')
    .replace(/z/g, 'ζ')
    .replace(/h/g, 'η')
    .replace(/i/g, 'ι')
    .replace(/k/g, 'κ')
    .replace(/l/g, 'λ')
    .replace(/m/g, 'μ')
    .replace(/n/g, 'ν')
    .replace(/o/g, 'ο')
    .replace(/p/g, 'π')
    .replace(/r/g, 'ρ')
    .replace(/s/g, 'σ')
    .replace(/t/g, 'τ')
    .replace(/u/g, 'υ')
    .replace(/v/g, 'β')
    .replace(/w/g, 'ω')
    .replace(/y/g, 'υ')
    .replace(/x/g, 'ξ')
    .replace(/c/g, 'κ')
    .replace(/f/g, 'φ')
    .replace(/j/g, 'τζ')
    .replace(/q/g, 'κ')
    .replace(/ /g, '');
};

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined,
);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

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
        allContacts.map(c => ({
          recordID: c.recordID,
          givenName: c.givenName || '',
          familyName: c.familyName || '',
          displayName: c.displayName || c.givenName || '',
          phoneNumbers: c.phoneNumbers || [],
        })),
      );
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const normalizeGreekName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove accents
  };

  const namesMatch = (contactName: string, namedayName: string): boolean => {
    const normalizedContact = normalizeGreekName(contactName);
    const normalizedNameday = normalizeGreekName(namedayName);

    if (!normalizedContact || !normalizedNameday) return false;

    // Exact match
    if (normalizedContact === normalizedNameday) return true;

    // Check if contact name is within the nameday name (for compound names)
    const contactWords = normalizedContact.split(/\s+/);
    const namedayWords = normalizedNameday.split(/\s+/);

    // Check if any word in contact name matches any word in nameday
    return contactWords.some(cWord =>
      namedayWords.some(
        nWord =>
          cWord === nWord ||
          (cWord.length >= 4 && nWord.startsWith(cWord)) ||
          (nWord.length >= 4 && cWord.startsWith(nWord)),
      ),
    );
  };

  const getContactsForNameday = (names: string[]): Contact[] => {
    if (!names || names.length === 0) return [];

    return contacts.filter(contact => {
      const givenName = contact.givenName;

      return names.some(namedayName => namesMatch(givenName, namedayName));
    });
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
  }, []);

  const handleAppStateChange = async (state: AppStateStatus) => {
    // Refresh contacts when app comes to foreground
    if (state === 'active' && hasPermission) {
      await loadContacts();
    }
  };

  const refreshContacts = async () => {
    if (hasPermission) {
      await loadContacts();
    }
  };

  const value: ContactsContextType = {
    contacts,
    hasPermission,
    requestPermission,
    getContactsForNameday,
    searchContactsByGreeklish,
    refreshContacts,
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
