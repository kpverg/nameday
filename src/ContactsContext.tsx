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

interface Contact {
  recordID: string;
  givenName: string;
  familyName: string;
  displayName: string;
  phoneNumbers: { label: string; number: string }[];
  givenNameGreeklish?: string;
}

interface SchemaMember {
  id: string;
  name: string;
  relation: string;
  birthday: string | null;
  schemaName?: string;
  isFromSchema?: boolean;
}

interface ContactsContextType {
  contacts: Contact[];
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getContactsForNameday: (names: string[]) => Contact[];
  getSchemaMembersForNameday: (names: string[]) => SchemaMember[];
  searchContactsByGreeklish: (query: string) => Contact[];
  refreshContacts: () => Promise<void>;
  schemaMembers: SchemaMember[];
}

const SCHEMAS_STORAGE_KEY = '@nameday_schemas';

// Greek to Greeklish conversion map
const greekToGreeklish = (str: string): string => {
  // First, remove accents
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const map: { [key: string]: string } = {
    Θ: 'Th',
    θ: 'th',
    Χ: 'Ch',
    χ: 'ch',
    Ψ: 'Ps',
    ψ: 'ps',
    Α: 'A',
    α: 'a',
    Β: 'V',
    β: 'v',
    Γ: 'G',
    γ: 'g',
    Δ: 'D',
    δ: 'd',
    Ε: 'E',
    ε: 'e',
    Ζ: 'Z',
    ζ: 'z',
    Η: 'I',
    η: 'i',
    Ι: 'I',
    ι: 'i',
    Κ: 'K',
    κ: 'k',
    Λ: 'L',
    λ: 'l',
    Μ: 'M',
    μ: 'm',
    Ν: 'N',
    ν: 'n',
    Ξ: 'X',
    ξ: 'x',
    Ο: 'O',
    ο: 'o',
    Π: 'P',
    π: 'p',
    Ρ: 'R',
    ρ: 'r',
    Σ: 'S',
    σ: 's',
    ς: 's',
    Τ: 'T',
    τ: 't',
    Υ: 'Y',
    υ: 'y',
    Φ: 'F',
    φ: 'f',
    Ω: 'O',
    ω: 'o',
  };

  let result = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    result += map[char] || char;
  }
  return result.toLowerCase();
};

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
  const [schemaMembers, setSchemaMembers] = useState<SchemaMember[]>([]);

  // Load schemas and extract members
  const loadSchemas = async () => {
    try {
      const stored = await AsyncStorage.getItem(SCHEMAS_STORAGE_KEY);
      console.log(
        '[ContactsContext] Loading schemas from storage:',
        stored ? 'found' : 'empty',
      );
      if (stored) {
        const schemas = JSON.parse(stored);
        console.log('[ContactsContext] Parsed schemas:', schemas.length);
        const allMembers: SchemaMember[] = [];

        schemas.forEach((schema: any) => {
          console.log(
            '[ContactsContext] Processing schema:',
            schema.name,
            'with',
            schema.members?.length,
            'members',
          );
          schema.members.forEach((member: any) => {
            allMembers.push({
              ...member,
              schemaName: schema.name,
              isFromSchema: true,
              phoneNumber: schema.contactPhoneNumber || null,
            });
          });
        });

        console.log(
          '[ContactsContext] Total schema members loaded:',
          allMembers.length,
        );
        setSchemaMembers(allMembers);
      } else {
        setSchemaMembers([]);
      }
    } catch (error) {
      console.error('Error loading schemas:', error);
    }
  };

  // Listen for storage changes
  useEffect(() => {
    // Load immediately on mount
    loadSchemas();

    // Reload schemas periodically to catch updates
    const interval = setInterval(loadSchemas, 3000);

    return () => clearInterval(interval);
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

  const normalizeGreekName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/ς$/, 'σ'); // Replace final ς with σ for better matching
  };

  const namesMatch = (contactName: string, namedayName: string): boolean => {
    let normalizedContact = normalizeGreekName(contactName);
    let normalizedNameday = normalizeGreekName(namedayName);

    if (!normalizedContact || !normalizedNameday) return false;

    // Remove trailing 'ς' or 'σ' for flexible matching (Ιωάννης vs Ιωάννη)
    const stripEnding = (str: string) => str.replace(/[ςσ]$/, '');
    const contactStripped = stripEnding(normalizedContact);
    const namedayStripped = stripEnding(normalizedNameday);

    // Exact match (with or without final sigma)
    if (normalizedContact === normalizedNameday) return true;
    if (contactStripped === namedayStripped) return true;

    // Check if contact name is within the nameday name (for compound names)
    const contactWords = normalizedContact.split(/\s+/);
    const namedayWords = normalizedNameday.split(/\s+/);

    // Check if any word in contact name matches any word in nameday
    const wordMatch = contactWords.some(cWord => {
      const cWordStripped = stripEnding(cWord);
      return namedayWords.some(nWord => {
        const nWordStripped = stripEnding(nWord);
        return (
          cWord === nWord ||
          cWordStripped === nWordStripped ||
          (cWord.length >= 4 && nWord.startsWith(cWord)) ||
          (nWord.length >= 4 && cWord.startsWith(nWord)) ||
          (cWordStripped.length >= 4 &&
            nWordStripped.startsWith(cWordStripped)) ||
          (nWordStripped.length >= 4 && cWordStripped.startsWith(nWordStripped))
        );
      });
    });

    if (wordMatch) return true;

    // Check Greeklish matching - already have normalized greeklish
    const contactGreeklish = greekToGreeklish(contactName);
    const namedayGreeklish = greekToGreeklish(namedayName);

    // Compare without spaces
    if (
      contactGreeklish.replace(/\s+/g, '') ===
      namedayGreeklish.replace(/\s+/g, '')
    ) {
      return true;
    }

    // Check if greeklish contact name starts with or is contained in nameday greeklish
    const contactGreeklishWords = contactGreeklish.split(/\s+/).filter(w => w);
    const namedayGreeklishWords = namedayGreeklish.split(/\s+/).filter(w => w);

    return contactGreeklishWords.some(cWord => {
      return namedayGreeklishWords.some(nWord => {
        return (
          cWord === nWord ||
          (cWord.length >= 4 && nWord.startsWith(cWord)) ||
          (nWord.length >= 4 && cWord.startsWith(nWord))
        );
      });
    });
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
      const contactGreeklish = contact.givenNameGreeklish || '';

      return namedayGreeklish.some(nameday =>
        namesMatch(givenName, nameday.original),
      );
    });
  };

  const getSchemaMembersForNameday = (names: string[]): SchemaMember[] => {
    if (!names || names.length === 0) return [];

    console.log(
      '[ContactsContext] getSchemaMembersForNameday called with names:',
      names,
    );
    console.log(
      '[ContactsContext] Total schemaMembers available:',
      schemaMembers.length,
    );

    const matching = schemaMembers.filter(member => {
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

    console.log('[ContactsContext] Matching schema members:', matching.length);
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
    getSchemaMembersForNameday,
    searchContactsByGreeklish,
    refreshContacts,
    schemaMembers,
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
