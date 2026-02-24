import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useContacts } from '../ContactsContext';
import {
  GREEK_MONTHS,
  GREEK_MONTHS_GENITIVE,
  GREEK_WEEKDAYS,
  getYearCelebrations,
} from '../services/namedayService';
import {
  getMyPeopleCelebratingOnDate,
  formatMyPersonCelebration,
} from '../services/myPeopleCelebrationService';

const DayItem = React.memo(
  ({
    day,
    celebrations,
    names,
    worldDays,
    isToday,
    year,
    monthIndex,
    monthNameGenitive,
    darkMode,
    effectiveTextColor,
    getContactsForNameday,
    getMyPeopleForNameday,
    hasPermission,
    myPeopleData,
    expanded,
    onToggleExpand,
    primaryColor,
    primaryColorLight,
    addAlpha,
  }: {
    day: number;
    celebrations: string[];
    names: string[];
    worldDays: string[];
    isToday: boolean;
    year: number;
    monthIndex: number;
    monthNameGenitive: string;
    darkMode?: boolean;
    effectiveTextColor?: string;
    getContactsForNameday: (names: string[]) => any[];
    getMyPeopleForNameday: (names: string[]) => any[];
    hasPermission: boolean;
    myPeopleData: any[];
    expanded: boolean;
    onToggleExpand: () => void;
    primaryColor: string;
    primaryColorLight: string;
    addAlpha: (color: string, alpha: number) => string;
  }) => {
    // Lazy load contacts only when expanded
    const contacts =
      expanded && hasPermission && names.length > 0
        ? getContactsForNameday(names)
        : [];

    const date = React.useMemo(() => new Date(year, monthIndex, day), [year, monthIndex, day]);
    
    // Memoize myPeople logic to avoid re-calculation on render
    const myPeople = React.useMemo(() => {
        if (!expanded) return [];
        // From nameday
        const namedayMembers = names.length > 0 ? getMyPeopleForNameday(names) : [];
        // From custom date
        const customMembers = getMyPeopleCelebratingOnDate(date, myPeopleData);
        
        const merged = [...namedayMembers];
        customMembers.forEach(cm => {
            if (!merged.find(m => m.id === cm.id)) {
                merged.push(cm);
            }
        });
        return merged;
    }, [expanded, names, date, myPeopleData, getMyPeopleForNameday]);

    const weekdayName = GREEK_WEEKDAYS[date.getDay()];
    const dayFormatted = String(day).padStart(2, '0');

    // Dynamic styles to avoid inline style linting errors
    const dynamicDayContainerStyle = {
      backgroundColor: isToday 
        ? addAlpha(primaryColor, darkMode ? 0.2 : 0.15) 
        : (darkMode ? '#1A2332' : addAlpha(primaryColor, 0.05)),
      borderColor: isToday 
        ? primaryColor 
        : (darkMode ? '#374151' : addAlpha(primaryColor, 0.15)),
      borderWidth: 1,
    };

    const dynamicDayNumberStyle = {
      color: isToday ? primaryColor : effectiveTextColor,
    };

    const dynamicSectionTitleStyle = {
      color: primaryColor,
    };

    const dynamicTextColorStyle = {
      color: effectiveTextColor,
    };

    const dynamicContactItemStyle = {
      backgroundColor: darkMode ? '#374151' : addAlpha(primaryColor, 0.08),
      borderColor: addAlpha(primaryColor, 0.15),
      borderWidth: 1,
    };

    return (
      <TouchableOpacity
        onPress={onToggleExpand}
        style={[
          styles.dayContainer,
          dynamicDayContainerStyle,
        ]}
      >
        <View style={styles.dayHeader}>
          <Text
            style={[
              styles.dayNumber,
              darkMode && styles.dayNumberDark,
              dynamicDayNumberStyle,
            ]}
          >
            {weekdayName} {dayFormatted} {monthNameGenitive}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={
              isToday
                ? primaryColor
                : darkMode
                ? primaryColorLight
                : primaryColor
            }
          />
        </View>
        {expanded && (
          <View
            style={[
              styles.expandedContent,
              darkMode && styles.expandedContentDark,
            ]}
          >
            <View style={styles.namesSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  darkMode && styles.sectionTitleDark,
                  dynamicSectionTitleStyle,
                ]}
              >
                Ονόματα:
              </Text>
              <Text
                style={[
                  styles.namesText,
                  darkMode && styles.namesTextDark,
                  dynamicTextColorStyle,
                ]}
              >
                {names.length > 0 && names[0] !== 'NULL' ? names.join(', ') : '—'}
              </Text>
            </View>
            {celebrations.length > 0 && celebrations[0] !== 'NULL' && (
              <View style={styles.celebrationsSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode && styles.sectionTitleDark,
                    dynamicSectionTitleStyle,
                  ]}
                >
                  Εορτές:
                </Text>
                {celebrations.map((celebration, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.celebrationText,
                      darkMode && styles.celebrationTextDark,
                      dynamicTextColorStyle,
                    ]}
                  >
                    • {celebration}
                  </Text>
                ))}
              </View>
            )}
            {worldDays.length > 0 && (
              <View style={styles.celebrationsSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode && styles.sectionTitleDark,
                    dynamicSectionTitleStyle,
                  ]}
                >
                  Παγκόσμιες ημέρες:
                </Text>
                {worldDays.map((worldDay, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.celebrationText,
                      darkMode && styles.celebrationTextDark,
                      dynamicTextColorStyle,
                    ]}
                  >
                    • {worldDay}
                  </Text>
                ))}
              </View>
            )}
            {contacts && contacts.length > 0 && (
              <View style={styles.celebrationsSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode && styles.sectionTitleDark,
                    dynamicSectionTitleStyle,
                  ]}
                >
                  Επαφές που γιορτάζουν:
                </Text>
                <View style={styles.contactsRow}>
                  {contacts.map((contact, _index) => (
                    <TouchableOpacity
                      key={contact.recordID}
                      style={[styles.contactItem, dynamicContactItemStyle]}
                      onPress={() => {
                        if (
                          !contact.phoneNumbers ||
                          contact.phoneNumbers.length === 0
                        ) {
                          Alert.alert(
                            'Πρόβλημα',
                            'Η επαφή δεν έχει αποθηκευμένο τηλέφωνο',
                          );
                          return;
                        }
                        const phoneNumber = contact.phoneNumbers[0].number;
                        Alert.alert(contact.displayName, 'Επιλέξτε ενέργεια:', [
                          {
                            text: '📞 Κλήση',
                            onPress: () =>
                              Linking.openURL(`tel:${phoneNumber}`),
                          },
                          {
                            text: '✉️ SMS',
                            onPress: () =>
                              Linking.openURL(`sms:${phoneNumber}`),
                          },
                          { text: 'Ακύρωση', style: 'cancel' },
                        ]);
                      }}
                    >
                      <Text
                        style={[
                          styles.contactNameClickable,
                          darkMode && styles.namesTextDark,
                          dynamicTextColorStyle,
                        ]}
                      >
                        {contact.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {myPeople && myPeople.length > 0 && (
              <View style={styles.celebrationsSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode && styles.sectionTitleDark,
                    dynamicSectionTitleStyle,
                  ]}
                >
                  Δικοί μου άνθρωποι (εορτολόγιο):
                </Text>
                <View style={styles.contactsRow}>
                  {myPeople.map((member: any) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[styles.contactItem, dynamicContactItemStyle]}
                      onPress={() => {
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
                        const fullName = formatMyPersonCelebration(member);
                        Alert.alert(fullName, 'Επιλέξτε ενέργεια:', buttons, {
                          cancelable: true,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.contactNameClickable,
                          darkMode && styles.namesTextDark,
                          dynamicTextColorStyle,
                        ]}
                      >
                        {formatMyPersonCelebration(member)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {names.length === 0 &&
              celebrations.length === 0 &&
              worldDays.length === 0 && (
                <Text
                  style={[
                    styles.noCelebrationsText,
                    darkMode && styles.noCelebrationsTextDark,
                    dynamicTextColorStyle,
                  ]}
                >
                  Δεν υπάρχουν γιορτές
                </Text>
              )}
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

import { getFestsByMonth } from '../services/apiservices/totalMonthFests';
import { getWorldDaysByMonth, WorldDay } from '../services/apiservices/worldday';
import type { Fest } from '../types/fest';

export const TotalCelebrationsScreen = ({ 
  dbFests: initialDbFests,
  dbWorldDays: initialDbWorldDays
}: { 
  dbFests?: Fest[],
  dbWorldDays?: WorldDay[]
}) => {
  const {
    darkModeEnabled,
    selectedYear,
    backgroundColor,
    effectiveTextColor,
    globalDaysEnabled,
    primaryColor,
    primaryColorLight,
    addAlpha,
  } = useAppContext();
  const {
    hasPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    myPeople,
  } = useContacts();
  const now = React.useMemo(() => new Date(), []);
  
  // Use state for the month data so we can update it when month changes
  const [dbMonthData, setDbMonthData] = useState<Record<number, Fest[]>>({
    [now.getMonth()]: initialDbFests || []
  });
  const [dbWorldDayData, setDbWorldDayData] = useState<Record<number, WorldDay[]>>({
    [now.getMonth()]: initialDbWorldDays || []
  });
  const [displayMonthIndex, setDisplayMonthIndex] = useState<number>(
    now.getMonth(),
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // When props change (initial load), update state
  useEffect(() => {
    if (initialDbFests && initialDbFests.length > 0) {
      setDbMonthData(prev => ({ ...prev, [now.getMonth()]: initialDbFests }));
    }
  }, [initialDbFests, now]);

  useEffect(() => {
    if (initialDbWorldDays && initialDbWorldDays.length > 0) {
      setDbWorldDayData(prev => ({ ...prev, [now.getMonth()]: initialDbWorldDays }));
    }
  }, [initialDbWorldDays, now]);

  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(0);
  const scrollDelay = 300; // milliseconds

  // Dynamic styles to avoid inline style linting errors
  const dynamicContainerStyle = {
    backgroundColor: darkModeEnabled ? '#111827' : backgroundColor,
  };

  const dynamicTextColorStyle = {
    color: effectiveTextColor,
  };

  // Use memoized year data
  const yearData = React.useMemo(() => {
    return getYearCelebrations(selectedYear || now.getFullYear());
  }, [selectedYear, now]);

  // Fetch data when month changes or prefetch adjacent months
  useEffect(() => {
    const fetchMonthData = async (monthIdx: number) => {
      if (dbMonthData[monthIdx]) return; // Already fetched

      const monthName = GREEK_MONTHS[monthIdx];
      console.log(`Fetching SQLite data for ${monthName}...`);
      try {
        const newData = await getFestsByMonth(monthName);
        setDbMonthData(prev => ({ ...prev, [monthIdx]: newData || [] }));

        // Fetch world days if enabled
        if (globalDaysEnabled) {
          const wdData = await getWorldDaysByMonth(monthName);
          setDbWorldDayData(prev => ({ ...prev, [monthIdx]: wdData || [] }));
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${monthName}:`, error);
      }
    };

    // Fetch current month
    fetchMonthData(displayMonthIndex);

    // Prefetch next month
    if (displayMonthIndex < 11) {
      fetchMonthData(displayMonthIndex + 1);
    }
    
    // Prefetch previous month
    if (displayMonthIndex > 0) {
      fetchMonthData(displayMonthIndex - 1);
    }
  }, [displayMonthIndex, globalDaysEnabled, dbMonthData]);

  // Filter for the current display month and merge with SQLite data
  const daysData = React.useMemo(() => {
    // Current month's local data
    const localDays = yearData.filter(d => d.monthIndex === displayMonthIndex);

    const monthName = GREEK_MONTHS[displayMonthIndex];

    // Filter SQLite data for this month (just in case)
    // We trim to handle potential invisible spaces from DB
    const currentMonthFests = dbMonthData[displayMonthIndex]?.filter(f => 
      f.month?.trim() === monthName?.trim()
    ) || [];
    const currentMonthWorldDays = dbWorldDayData[displayMonthIndex]?.filter(w => 
      w.month?.trim() === monthName?.trim()
    ) || [];

    // Map over local days and merge if we have local SQLite data
    return localDays.map(localDay => {
      // Find matching SQLite day
      const dbDay = currentMonthFests.find(f => Number(f.day) === localDay.day);
      const dbWD = currentMonthWorldDays.filter(w => Number(w.day) === localDay.day);

      let mergedNames = localDay.names;
      let mergedCelebs = localDay.celebrations;
      let mergedWorldDays = localDay.worldDays;

      if (dbDay) {
        const remoteNames = dbDay.names ? (dbDay.names as string).split(',').map((n: string) => n.trim()) : [];
        const remoteCelebs = dbDay.celebrations ? (dbDay.celebrations as string).split(',').map((c: string) => c.trim()) : [];
        
        mergedNames = Array.from(new Set([...localDay.names, ...remoteNames]));
        mergedCelebs = Array.from(new Set([...localDay.celebrations, ...remoteCelebs]));
      }

      if (dbWD.length > 0) {
        // Collect titles from all SQLite world days for this day
        const wdTitles = dbWD.map(w => w.title).filter(Boolean) as string[];
        if (wdTitles.length > 0) {
          mergedWorldDays = wdTitles;
        }
      }

      return {
        ...localDay,
        names: mergedNames,
        celebrations: mergedCelebs,
        worldDays: mergedWorldDays,
      };
    });

  }, [yearData, displayMonthIndex, dbMonthData, dbWorldDayData]);

  // Effect to scroll to today when the screen opens or the month changes to current month
  useEffect(() => {
    const today = new Date();
    const isCurrentMonth = displayMonthIndex === today.getMonth();
    const isCurrentYear = (selectedYear || today.getFullYear()) === today.getFullYear();
    
    if (isCurrentMonth && isCurrentYear && daysData.length > 0) {
      const todayIndex = daysData.findIndex(d => d.day === today.getDate());
      if (todayIndex !== -1) {
        // Jump immediately to today without animation
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: todayIndex,
            animated: false,
            viewPosition: 0, // 0 = top of index
          });
        }, 100);
      }
    } else if (daysData.length > 0) {
      // For any other month, jump to the start of the month
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });
      }, 100);
    }
  }, [displayMonthIndex, selectedYear, daysData]);

  const monthName = GREEK_MONTHS[displayMonthIndex];
  const displayYear = selectedYear || now.getFullYear();

  const handlePrevMonth = () => {
    const currentTime = Date.now();
    if (currentTime - lastScrollTime.current < scrollDelay) return;
    lastScrollTime.current = currentTime;
    setExpandedDay(null);
    setDisplayMonthIndex(prev => (prev - 1 < 0 ? 0 : prev - 1));
  };

  const handleNextMonth = () => {
    const currentTime = Date.now();
    if (currentTime - lastScrollTime.current < scrollDelay) return;
    lastScrollTime.current = currentTime;
    setExpandedDay(null);
    setDisplayMonthIndex(prev => (prev + 1 > 11 ? 11 : prev + 1));
  };

  return (
    <View
      style={[
        styles.container,
        dynamicContainerStyle,
      ]}
    >
      <View style={[styles.header, darkModeEnabled && styles.headerDark]}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={darkModeEnabled ? primaryColorLight : primaryColor}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              darkModeEnabled && styles.titleDark,
              dynamicTextColorStyle,
            ]}
          >
            Οι εορτές του μήνα
          </Text>
          <Text
            style={[
              styles.subtitle,
              darkModeEnabled && styles.subtitleDark,
              dynamicTextColorStyle,
            ]}
          >
            {monthName}
          </Text>
          <Text
            style={[
              styles.yearText,
              darkModeEnabled && styles.yearTextDark,
              dynamicTextColorStyle,
            ]}
          >
            {selectedYear}
          </Text>
        </View>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={darkModeEnabled ? primaryColorLight : primaryColor}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={daysData}
        renderItem={({ item }) => (
          <DayItem
            day={item.day}
            celebrations={item.celebrations}
            names={item.names}
            worldDays={item.worldDays}
            isToday={item.isToday}
            year={displayYear}
            monthIndex={displayMonthIndex}
            monthNameGenitive={GREEK_MONTHS_GENITIVE[displayMonthIndex]}
            darkMode={darkModeEnabled}
            effectiveTextColor={effectiveTextColor}
            getContactsForNameday={getContactsForNameday}
            getMyPeopleForNameday={getMyPeopleForNameday}
            hasPermission={hasPermission}
            myPeopleData={myPeople}
            expanded={expandedDay === item.day}
            onToggleExpand={() => setExpandedDay(expandedDay === item.day ? null : item.day)}
            primaryColor={primaryColor}
            primaryColorLight={primaryColorLight}
            addAlpha={addAlpha}
          />
        )}
        keyExtractor={item => String(item.day)}
        scrollEnabled={true}
        initialNumToRender={31}
        getItemLayout={(data, index) => ({
          length: 64, // exact height of a collapsed DayItem including margins
          offset: 64 * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });
        }}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  containerDark: {
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerDark: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  yearTextDark: {
    color: '#93C5FD',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  titleDark: {
    color: '#F3F4F6',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  dayContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  dayContainerDark: {
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expandedContentDark: {
    borderTopColor: '#374151',
  },
  namesSection: {
    marginBottom: 12,
  },
  celebrationsSection: {
    marginBottom: 8,
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 4,
  },
  contactActions: {
    flexDirection: 'row',
    marginLeft: 4,
    gap: 3,
  },
  actionButton: {
    padding: 1,
  },
  contactName: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',

    marginBottom: 6,
  },
  sectionTitleDark: {
  },
  contactNameButton: {
    marginRight: 4,
  },
  contactNameClickable: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  myPeopleMemberItem: {
    flexDirection: 'column',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 5,
    marginBottom: 4,
  },
  myPeopleLabel: {
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
  namesText: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
  },
  namesTextDark: {
    color: '#E5E7EB',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayNumberDark: {
  },
  celebrationText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  celebrationTextDark: {
    color: '#E5E7EB',
  },
  noCelebrationsText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  noCelebrationsTextDark: {
    color: '#6B7280',
  },
});
