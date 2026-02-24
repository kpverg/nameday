import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
// Disable lint rule that flags inline styles as errors in editor
/* eslint-disable react-native/no-inline-styles */
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { useContacts } from '../ContactsContext';
import {
  findNamedayLocal,
  findWorldDayLocal,
  formatDate,
} from '../services/namedayService';
import {
  getMyPeopleCelebratingOnDate,
  formatMyPersonCelebration,
} from '../services/myPeopleCelebrationService';

import {
  GestureHandlerRootView,
  FlingGestureHandler,
  Directions,
  State,
} from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
// Navigation imports not used with custom bottom nav
import { TotalCelebrationsScreen } from './TotalCelebrationsScreen';
import { WeekScreen } from './WeekScreen';
import MyPeopleScreen from './MyPeopleScreen';
import { SettingsScreen } from './SettingsScreen';
import SearchScreen from './SearchScreen';
import SaintScreen from './SaintScreen';
import { SCROLL_DELAYS } from '../utils/scrollchangingscreens';
import type { Fest } from '../types/fest';
import type { WorldDay } from '../services/apiservices/worldday';
import type { Saint } from '../types/saint';

function DayScreenContent({ 
  dbFests, 
  dbWorldDays,
  todaySaints,
  onSelectSaint,
}: { 
  dbFests?: Fest[];
  dbWorldDays?: WorldDay[];
  todaySaints?: Saint[];
  onSelectSaint?: (saint: Saint) => void;
}) {
  const {
    globalDaysEnabled,
    darkModeEnabled,
    backgroundColor,
    effectiveTextColor,
    primaryColor,
    primaryColorLight,
    addAlpha,
  } = useAppContext();
  const {
    hasPermission,
    requestPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    myPeople,
  } = useContacts();

  const [dateString, setDateString] = useState(formatDate(new Date()));
  const [namesToday, setNamesToday] = useState<string[]>([]);
  const [celebrationToday, setCelebrationToday] = useState<string | null>(null);
  const [worldDayToday, setWorldDayToday] = useState<string | null>(null);
  const [contactsCelebrating, setContactsCelebrating] = useState<any[]>([]);
  const [myPeopleCelebrating, setMyPeopleCelebrating] = useState<any[]>([]);
  const [activeSaintIndex, setActiveSaintIndex] = useState(0);

  useEffect(() => {
    if (todaySaints && todaySaints.length > 1) {
      const interval = setInterval(() => {
        setActiveSaintIndex(prev => (prev + 1) % todaySaints.length);
      }, 4000); // Cycle every 4 seconds
      return () => clearInterval(interval);
    }
  }, [todaySaints]);

  useEffect(() => {
    let timeoutId: any;

    const applyUpdate = () => {
      const now = new Date();
      setDateString(formatDate(now));
      const entry = findNamedayLocal(now);
      const localNames = entry?.names ?? [];
      
      // Merge database names with local movable names
      const dbNames = dbFests?.[0]?.names && dbFests[0].names !== 'NULL' ? dbFests[0].names.split(',').map(n => n.trim()) : [];
      const names = Array.from(new Set([...localNames, ...dbNames]));
      
      setNamesToday(names);
      
      // Merge database celebrations with local movable celebrations
      const dbCelebs = dbFests?.[0]?.celebrations && dbFests[0].celebrations !== 'NULL' ? dbFests[0].celebrations.split(',').map(c => c.trim()) : [];
      const localCelebs = entry?.celebrations ?? [];
      const allCelebs = Array.from(new Set([...localCelebs, ...dbCelebs]));
      
      setCelebrationToday(allCelebs.length > 0 ? allCelebs.join(', ') : null);

      if (globalDaysEnabled) {
        // Use database world days if available, otherwise fallback to local
        const dbWD = dbWorldDays?.map(w => w.title).filter(Boolean).join(', ');
        setWorldDayToday(dbWD || findWorldDayLocal(now));
      } else {
        setWorldDayToday(null);
      }
      // Get contacts celebrating today
      if (hasPermission && names.length > 0) {
        const contacts = getContactsForNameday(names);
        setContactsCelebrating(contacts);
      } else {
        setContactsCelebrating([]);
      }

      // Get my people celebrating today
      const namedayMembers = names.length > 0 ? getMyPeopleForNameday(names) : [];
      const customDateMembers = getMyPeopleCelebratingOnDate(now, myPeople);
      
      // Merge and remove duplicates by ID
      const allMyPeople = [...namedayMembers];
      customDateMembers.forEach(cdm => {
        if (!allMyPeople.find(amp => amp.id === cdm.id)) {
          allMyPeople.push(cdm);
        }
      });

      setMyPeopleCelebrating(allMyPeople);
    };
    const scheduleNext = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0,
      );
      const timeoutMs = nextMidnight.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        applyUpdate();
        scheduleNext();
      }, timeoutMs);
    };

    applyUpdate();
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [
    globalDaysEnabled,
    hasPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    myPeople,
    dbFests,
    dbWorldDays,
  ]);

  return (
    <ScrollView
      style={[
        styles.screenContainer,
        { backgroundColor: darkModeEnabled ? '#111827' : backgroundColor },
      ]}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroWrap, { backgroundColor: primaryColor }]}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <Text style={[styles.heroDate, { color: '#fff' }]}>
              {dateString}
            </Text>
            {celebrationToday ? (
              <Text
                style={[styles.heroCelebration, { color: '#fff' }]}
              >
                {celebrationToday}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <View
        style={[
          styles.content,
          { backgroundColor: darkModeEnabled ? '#1F2937' : backgroundColor },
        ]}
      >
        <View
          style={[
            styles.celebrationBox,
            {
              backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
              borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
            },
          ]}
        >
          <View style={styles.textColumn}>
            <Text
              style={[
                styles.label,
                darkModeEnabled && styles.labelDark,
                { color: effectiveTextColor },
              ]}
            >
              Ονόματα σήμερα:
            </Text>
            {namesToday.length > 0 && namesToday[0] !== 'NULL' ? (
              <Text
                style={[
                  styles.namesList,
                  darkModeEnabled && styles.namesListDark,
                  { color: effectiveTextColor },
                ]}
              >
                {namesToday.join(', ')}
              </Text>
            ) : (
              <Text
                style={[
                  styles.placeholder,
                  darkModeEnabled && styles.placeholderDark,
                ]}
              >
                —
              </Text>
            )}
          </View>
        </View>
        {celebrationToday && celebrationToday !== 'NULL' && (
          <View
            style={[
              styles.celebrationBox,
              {
                backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
              },
            ]}
          >
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.label,
                  darkModeEnabled && styles.labelDark,
                  { color: effectiveTextColor },
                ]}
              >
                Εορτές σήμερα:
                <Text
                  style={[
                    styles.namesList,
                    darkModeEnabled && styles.namesListDark,
                    { color: effectiveTextColor },
                  ]}
                >
                  {celebrationToday}
                </Text>
              </Text>
            </View>
          </View>
        )}
        {todaySaints && todaySaints.length > 0 && (
          <TouchableOpacity
            style={[
              styles.celebrationBox,
              {
                backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
              },
            ]}
            onPress={() => onSelectSaint?.(todaySaints[activeSaintIndex])}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {todaySaints[activeSaintIndex].image_url ? (
                <Image
                  source={{ 
                    uri: todaySaints[activeSaintIndex].image_url.startsWith('img/') 
                      ? `asset:/${todaySaints[activeSaintIndex].image_url}` 
                      : todaySaints[activeSaintIndex].image_url 
                  }}
                  style={{ width: 40, height: 40, borderRadius: 4, marginRight: 15 }}
                  resizeMode="contain"
                />
              ) : (
                <Icon
                  name="book-open-variant"
                  size={34}
                  color={darkModeEnabled ? primaryColorLight : primaryColor}
                  style={{ marginRight: 15 }}
                />
              )}
              <View style={styles.textColumn}>
                <Text
                  style={[
                    styles.label,
                    darkModeEnabled && styles.labelDark,
                    { color: effectiveTextColor, marginBottom: 2 },
                  ]}
                >
                  Βίοι Αγίων:
                </Text>
                <Text
                  style={[
                    styles.namesList,
                    darkModeEnabled && styles.namesListDark,
                    { color: effectiveTextColor, fontSize: 16, fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {todaySaints[activeSaintIndex].name}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={darkModeEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} 
              />
            </View>
          </TouchableOpacity>
        )}
        {worldDayToday && (
          <View
            style={[
              styles.celebrationBox,
              {
                backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
              },
            ]}
          >
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.label,
                  darkModeEnabled && styles.labelDark,
                  { color: effectiveTextColor },
                ]}
              >
                Παγκόσμιες ημέρες:
                <Text
                  style={[
                    styles.namesList,
                    darkModeEnabled && styles.namesListDark,
                    { color: effectiveTextColor },
                  ]}
                >
                  {worldDayToday}
                </Text>
              </Text>
            </View>
          </View>
        )}
        {!hasPermission && (
          <View
            style={[
              styles.celebrationBox,
              {
                backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
              },
            ]}
          >
            <Icon
              name="account-multiple"
              size={40}
              color={darkModeEnabled ? primaryColorLight : primaryColor}
            />
            <View style={[styles.textColumn, { flex: 1 }]}>
              <Text
                style={[
                  styles.label,
                  darkModeEnabled && styles.labelDark,
                  { color: effectiveTextColor },
                ]}
              >
                Δώστε πρόσβαση στις επαφές για να δείτε ποιοι φίλοι σας
                γιορτάζουν!
              </Text>
              <TouchableOpacity
                style={[
                  styles.permissionButton,
                  { backgroundColor: primaryColor },
                ]}
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>Δώστε άδεια</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {hasPermission && contactsCelebrating.length > 0 && (
          <View
            style={[
              styles.celebrationBox,
              {
                backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
              },
            ]}
          >
            <Icon
              name="account-heart"
              size={40}
              color={darkModeEnabled ? primaryColorLight : primaryColor}
            />
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.label,
                  darkModeEnabled && styles.labelDark,
                  { color: effectiveTextColor },
                ]}
              >
                Επαφές που γιορτάζουν:
              </Text>
              <View style={styles.contactsRow}>
                {contactsCelebrating.map(contact => (
                  <TouchableOpacity
                    key={contact.recordID}
                    style={styles.contactItem}
                    onPress={() => {
                      if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
                        Alert.alert('Πρόβλημα', 'Η επαφή δεν έχει αποθηκευμένο τηλέφωνο');
                        return;
                      }
                      const phoneNumber = contact.phoneNumbers[0].number;
                      Alert.alert(contact.displayName, 'Επιλέξτε ενέργεια:', [
                        { text: '📞 Κλήση', onPress: () => Linking.openURL(`tel:${phoneNumber}`) },
                        { text: '✉️ SMS', onPress: () => Linking.openURL(`sms:${phoneNumber}`) },
                        { text: 'Ακύρωση', style: 'cancel' },
                      ]);
                    }}
                  >
                    <Text
                      style={[
                        styles.contactName,
                        darkModeEnabled && styles.namesListDark,
                        { color: effectiveTextColor },
                      ]}
                    >
                      {contact.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
        {myPeopleCelebrating.length > 0 && (
          <View
            style={[
              styles.celebrationBox,
              {
                backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
              },
            ]}
          >
            <Icon name="account-group" size={40} color="#10B981" />
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.label,
                  darkModeEnabled && styles.labelDark,
                  { color: effectiveTextColor },
                ]}
              >
                Δικοί μου άνθρωποι (εορτολόγιο):
              </Text>
              <View style={styles.contactsRow}>
                {myPeopleCelebrating.map(member => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.contactItem}
                    onPress={() => {
                      const fullName = formatMyPersonCelebration(member);
                      if (!member.phoneNumber) {
                        Alert.alert(
                          'Πρόβλημα',
                          'Η επαφή δεν έχει αποθηκευμένο τηλέφωνο',
                        );
                        return;
                      }
                      const buttons = [
                        {
                          text: '📞 Κλήση',
                          onPress: () =>
                            Linking.openURL(`tel:${member.phoneNumber}`),
                        },
                        {
                          text: '✉️ SMS',
                          onPress: () =>
                            Linking.openURL(`sms:${member.phoneNumber}`),
                        },
                        {
                          text: 'Κλείσιμο',
                          style: 'cancel' as 'cancel',
                        },
                      ];
                      Alert.alert(fullName, 'Επιλέξτε ενέργεια:', buttons, {
                        cancelable: true,
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.contactName,
                        darkModeEnabled && styles.namesListDark,
                        { color: effectiveTextColor },
                      ]}
                    >
                      {formatMyPersonCelebration(member)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type TopBarProps = {
  onToggleYearPicker: () => void;
  showYearPicker: boolean;
  yearOptions: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onSearch: () => void;
};

function TopBar({
  onToggleYearPicker,
  showYearPicker,
  yearOptions,
  selectedYear,
  onSelectYear,
  onSearch,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { darkModeEnabled, primaryColor, addAlpha } = useAppContext();
  return (
    <View
      style={[
        styles.topBar,
        { backgroundColor: primaryColor },
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.topLeft}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onToggleYearPicker}
          style={{ padding: 6 }}
        >
          <Ionicons name="calendar-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.topTitle}>Εορτολόγιο</Text>
      <View style={styles.topRight}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.iconButton}
          onPress={onSearch}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {showYearPicker && (
        <View
          style={[
            styles.yearPickerPanel,
            darkModeEnabled && styles.yearPickerPanelDark,
          ]}
        >
          {yearOptions.map(y => (
            <TouchableOpacity
              key={y}
              onPress={() => onSelectYear(y)}
              style={[
                styles.yearOption,
                y === selectedYear && { backgroundColor: addAlpha(primaryColor, 0.2) },
              ]}
            >
              <Text
                style={[
                  styles.yearOptionText,
                  darkModeEnabled && styles.yearOptionTextDark,
                ]}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// getTabIcon: not used with custom bottom nav

const colors = {
  bgSecondary: '#F3F4F6',
};

export default function MainScreen({ 
  dbFests,
  dbMonthFests,
  dbWorldDays,
  dbMonthWorldDays,
  todaySaints,
}: { 
  dbFests?: Fest[];
  dbMonthFests?: Fest[];
  dbWorldDays?: WorldDay[];
  dbMonthWorldDays?: WorldDay[];
  todaySaints?: Saint[];
}) {
  const {
    darkModeEnabled,
    selectedYear,
    setSelectedYear,
    primaryColor,
    primaryColorLight,
  } = useAppContext();
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<
    'day' | 'month' | 'week' | 'close' | 'settings' | 'search' | 'saint'
  >('day');
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);

  const yearOptions = useMemo(() => {
    const baseYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => baseYear + i);
  }, []);

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  const screens = useMemo<('day' | 'month' | 'week' | 'close' | 'settings')[]>(
    () => ['day', 'month', 'week', 'close', 'settings'],
    [],
  );

  const navigateToNext = () => {
    const currentIndex = screens.indexOf(currentScreen as any);
    if (currentIndex < screens.length - 1) {
      setTimeout(() => {
        setCurrentScreen(screens[currentIndex + 1]);
      }, SCROLL_DELAYS.SHORT);
    }
  };

  const navigateToPrev = () => {
    const currentIndex = screens.indexOf(currentScreen as any);
    if (currentIndex > 0) {
      setTimeout(() => {
        setCurrentScreen(screens[currentIndex - 1]);
      }, SCROLL_DELAYS.SHORT);
    }
  };

  useEffect(() => {
    setShowYearPicker(false);
  }, [currentScreen]);

  const renderCurrent = () => {
    switch (currentScreen) {
      case 'day':
        return (
          <DayScreenContent 
            dbFests={dbFests} 
            dbWorldDays={dbWorldDays} 
            todaySaints={todaySaints}
            onSelectSaint={(s) => {
              setSelectedSaint(s);
              setCurrentScreen('saint');
            }}
          />
        );
      case 'month':
        return (
          <TotalCelebrationsScreen 
            dbFests={dbMonthFests} 
            dbWorldDays={dbMonthWorldDays} 
          />
        );
      case 'week':
        return (
          <WeekScreen 
            dbMonthFests={dbMonthFests} 
            dbMonthWorldDays={dbMonthWorldDays} 
          />
        );
      case 'close':
        return <MyPeopleScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'search':
        return <SearchScreen onBack={() => setCurrentScreen('day')} />;
      case 'saint':
        return (
          <SaintScreen 
            saint={selectedSaint || (todaySaints && todaySaints[0]) || undefined} 
            allSaints={todaySaints}
            onNextSaint={() => {
              if (todaySaints) {
                const currentIndex = todaySaints.findIndex(s => s.id === (selectedSaint?.id || todaySaints[0]?.id));
                if (currentIndex < todaySaints.length - 1) {
                  setSelectedSaint(todaySaints[currentIndex + 1]);
                }
              }
            }}
            onPrevSaint={() => {
              if (todaySaints) {
                const currentIndex = todaySaints.findIndex(s => s.id === (selectedSaint?.id || todaySaints[0]?.id));
                if (currentIndex > 0) {
                  setSelectedSaint(todaySaints[currentIndex - 1]);
                }
              }
            }}
            onBack={() => {
              setSelectedSaint(null);
              setCurrentScreen('day');
            }} 
          />
        );
      default:
        return (
          <DayScreenContent 
            dbFests={dbFests} 
            dbWorldDays={dbWorldDays} 
            todaySaints={todaySaints}
            onSelectSaint={(s) => {
              setSelectedSaint(s);
              setCurrentScreen('saint');
            }}
          />
        );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[styles.container, darkModeEnabled && styles.containerDark]}
      >
        <TopBar
          onToggleYearPicker={() => setShowYearPicker(prev => !prev)}
          showYearPicker={showYearPicker}
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          onSelectYear={handleSelectYear}
          onSearch={() => setCurrentScreen('search')}
        />
        <FlingGestureHandler
          direction={Directions.LEFT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              navigateToNext();
            }
          }}
        >
          <View style={{ flex: 1 }}>
            <FlingGestureHandler
              direction={Directions.RIGHT}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) {
                  navigateToPrev();
                }
              }}
            >
              <View
                style={[
                  styles.contentArea,
                  darkModeEnabled && styles.contentAreaDark,
                ]}
              >
                {renderCurrent()}
              </View>
            </FlingGestureHandler>
          </View>
        </FlingGestureHandler>
        <View
          style={[
            styles.bottomNav,
            darkModeEnabled && styles.bottomNavDark,
            {
              backgroundColor: darkModeEnabled
                ? '#111827'
                : colors.bgSecondary,
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}
        >
          {[
            ['Ημέρα', 'home-outline', 'day'],
            ['Μήνας', 'calendar-month-outline', 'month'],
            ['Εβδομάδα', 'calendar-week-outline', 'week'],
            ['Δικοί μου', 'account-group-outline', 'close'],
            ['Ρυθμίσεις', 'cog-outline', 'settings'],
          ].map(([label, icon, screen]) => (
            <TouchableOpacity
              key={String(screen)}
              style={styles.navButton}
              onPress={() => setCurrentScreen(screen as any)}
            >
              <Icon
                name={String(icon)}
                size={24}
                color={
                  currentScreen === screen
                    ? darkModeEnabled
                      ? primaryColorLight
                      : primaryColor
                    : '#6b7280'
                }
              />
              <Text
                style={{
                  color:
                    currentScreen === screen
                      ? darkModeEnabled
                        ? primaryColorLight
                        : primaryColor
                      : '#6b7280',
                  marginTop: 4,
                  fontSize: 10,
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  contentArea: {
    flex: 1,
  },
  contentAreaDark: {
    backgroundColor: '#111827',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    position: 'relative',
  },
  topBarDark: {
  },
  topLeft: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRight: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 14,
  },
  yearPickerPanel: {
    position: 'absolute',
    top: '100%',
    left: 8,
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 6,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 20,
  },
  yearPickerPanelDark: {
    backgroundColor: '#1F2937',
  },
  yearOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  yearOptionSelected: {
    backgroundColor: '#E0ECFF',
  },
  yearOptionText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  yearOptionTextDark: {
    color: '#E5E7EB',
  },
  topTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    position: 'relative',
  },
  screenContainerDark: {
    backgroundColor: '#111827',
  },
  heroWrap: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 999,
  },
  heroCelebration: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  namesList: {
    fontSize: 14,
    color: '#374151',
  },
  namesListDark: {
    color: '#E5E7EB',
  },
  heroDate: {
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 12,
    marginTop: 0,
  },
  contentDark: {
    backgroundColor: '#111827',
  },
  celebrationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  textColumn: {
    flex: 1,
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  contactActions: {
    flexDirection: 'row',
    marginLeft: 6,
    gap: 4,
  },
  actionButton: {
    padding: 2,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
  },
  myPeopleMemberInfo: {
    flexDirection: 'column',
  },
  myPeopleLabel: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  labelDark: {
    color: '#F3F4F6',
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  placeholderDark: {
    color: '#6B7280',
  },
  permissionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: 'transparent',
    width: 70,
    height: 70,
    position: 'absolute',
    bottom: 24,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomNavDark: {
    borderTopColor: '#374151',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
