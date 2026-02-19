import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
/* eslint-disable react-native/no-inline-styles */
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
    backgroundColor,
    getContactsForNameday,
    getMyPeopleForNameday,
    hasPermission,
    myPeopleData,
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
    backgroundColor?: string;
    getContactsForNameday: (names: string[]) => any[];
    getMyPeopleForNameday: (names: string[]) => any[];
    hasPermission: boolean;
    myPeopleData: any[];
  }) => {
    const [expanded, setExpanded] = useState(false);

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

    return (
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          { backgroundColor: darkMode ? '#1F2937' : backgroundColor },
        ]}
      >
        <View style={styles.dayHeader}>
          <Text
            style={[
              styles.dayNumber,
              isToday && styles.todayNumber,
              darkMode && styles.dayNumberDark,
              { color: effectiveTextColor },
            ]}
          >
            {weekdayName} {dayFormatted} {monthNameGenitive}
          </Text>
          {(names.length > 0 ||
            celebrations.length > 0 ||
            worldDays.length > 0) && (
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={isToday ? '#0369A1' : darkMode ? '#60A5FA' : '#1E6AC7'}
            />
          )}
        </View>
        {expanded && (
          <View
            style={[
              styles.expandedContent,
              darkMode && styles.expandedContentDark,
            ]}
          >
            {names.length > 0 && (
              <View style={styles.namesSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode && styles.sectionTitleDark,
                    { color: effectiveTextColor },
                  ]}
                >
                  Ονόματα:
                </Text>
                <Text
                  style={[
                    styles.namesText,
                    darkMode && styles.namesTextDark,
                    { color: effectiveTextColor },
                  ]}
                >
                  {names.join(', ')}
                </Text>
              </View>
            )}
            {celebrations.length > 0 && (
              <View style={styles.celebrationsSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode && styles.sectionTitleDark,
                    { color: effectiveTextColor },
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
                      { color: effectiveTextColor },
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
                    { color: effectiveTextColor },
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
                      { color: effectiveTextColor },
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
                    { color: effectiveTextColor },
                  ]}
                >
                  Επαφές που γιορτάζουν:
                </Text>
                <View style={styles.contactsRow}>
                  {contacts.map((contact, _index) => (
                    <TouchableOpacity
                      key={contact.recordID}
                      style={styles.contactItem}
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
                          { color: effectiveTextColor },
                        ]}
                      >
                        {contact.displayName}
                      </Text>
                      {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                        <View style={styles.contactActions}>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(`tel:${contact.phoneNumbers[0].number}`)
                            }
                            style={styles.actionButton}
                          >
                            <Ionicons name="call" size={14} color="#10B981" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(`sms:${contact.phoneNumbers[0].number}`)
                            }
                            style={styles.actionButton}
                          >
                            <Ionicons name="mail" size={14} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      )}
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
                    { color: effectiveTextColor },
                  ]}
                >
                  Δικοί μου άνθρωποι (εορτολόγιο):
                </Text>
                <View style={styles.contactsRow}>
                  {myPeople.map((member: any) => (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.contactItem}
                      onPress={() => {
                        const buttons = [
                          ...(member.phoneNumber
                            ? [
                                {
                                  text: '📞 Κλήση',
                                  onPress: () =>
                                    Linking.openURL(
                                      `tel:${member.phoneNumber}`,
                                    ),
                                },
                                {
                                  text: '✉️ SMS',
                                  onPress: () =>
                                    Linking.openURL(
                                      `sms:${member.phoneNumber}`,
                                    ),
                                },
                              ]
                            : []),
                          {
                            text: 'Κλείσιμο',
                            style: 'cancel' as 'cancel',
                          },
                        ];
                        const fullName = formatMyPersonCelebration(member);
                        Alert.alert(
                          fullName,
                          'Επιλέξτε ενέργεια:',
                          buttons,
                          { cancelable: true },
                        );
                      }}
                    >
                      <Text
                        style={[
                          styles.contactNameClickable,
                          darkMode && styles.namesTextDark,
                          { color: effectiveTextColor },
                        ]}
                      >
                        {formatMyPersonCelebration(member)}
                      </Text>
                      {member.phoneNumber && (
                        <View style={styles.contactActions}>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(`tel:${member.phoneNumber}`)
                            }
                            style={styles.actionButton}
                          >
                            <Ionicons name="call" size={14} color="#10B981" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(`sms:${member.phoneNumber}`)
                            }
                            style={styles.actionButton}
                          >
                            <Ionicons name="mail" size={14} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      )}
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
                    { color: effectiveTextColor },
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

export const TotalCelebrationsScreen = () => {
  const {
    darkModeEnabled,
    selectedYear,
    backgroundColor,
    effectiveTextColor,
  } = useAppContext();
  const {
    hasPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    myPeople,
  } = useContacts();
  const now = React.useMemo(() => new Date(), []);
  const [displayMonthIndex, setDisplayMonthIndex] = useState<number>(
    now.getMonth(),
  );
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(0);
  const scrollDelay = 300; // milliseconds

  // Use memoized year data
  const yearData = React.useMemo(() => {
    return getYearCelebrations(selectedYear || now.getFullYear());
  }, [selectedYear, now]);

  // Filter for the current display month
  const daysData = React.useMemo(() => {
    return yearData.filter(d => d.monthIndex === displayMonthIndex);
  }, [yearData, displayMonthIndex]);

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
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: false,
          viewPosition: 0,
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
    setDisplayMonthIndex(prev => (prev - 1 < 0 ? 0 : prev - 1));
  };

  const handleNextMonth = () => {
    const currentTime = Date.now();
    if (currentTime - lastScrollTime.current < scrollDelay) return;
    lastScrollTime.current = currentTime;
    setDisplayMonthIndex(prev => (prev + 1 > 11 ? 11 : prev + 1));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkModeEnabled ? '#111827' : backgroundColor },
      ]}
    >
      <View style={[styles.header, darkModeEnabled && styles.headerDark]}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={darkModeEnabled ? '#60A5FA' : '#1E6AC7'}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              darkModeEnabled && styles.titleDark,
              { color: effectiveTextColor },
            ]}
          >
            Οι εορτές του μήνα
          </Text>
          <Text
            style={[
              styles.subtitle,
              darkModeEnabled && styles.subtitleDark,
              { color: effectiveTextColor },
            ]}
          >
            {monthName}
          </Text>
          <Text
            style={[
              styles.yearText,
              darkModeEnabled && styles.yearTextDark,
              { color: effectiveTextColor },
            ]}
          >
            {selectedYear}
          </Text>
        </View>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={darkModeEnabled ? '#60A5FA' : '#1E6AC7'}
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
            backgroundColor={backgroundColor}
            getContactsForNameday={getContactsForNameday}
            getMyPeopleForNameday={getMyPeopleForNameday}
            hasPermission={hasPermission}            myPeopleData={myPeople}          />
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  containerDark: {
    backgroundColor: '#111827',
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
    color: '#1E6AC7',
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
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E6AC7',
  },
  dayContainerDark: {
    backgroundColor: '#1F2937',
    borderLeftColor: '#60A5FA',
  },
  todayContainer: {
    backgroundColor: '#DBEAFE',
    borderLeftColor: '#1E6AC7',
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
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
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
    color: '#1E6AC7',
    marginBottom: 6,
  },
  sectionTitleDark: {
    color: '#60A5FA',
  },
  contactNameButton: {
    marginRight: 4,
  },
  contactNameClickable: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
    color: '#1E6AC7',
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
    color: '#1E6AC7',
    marginBottom: 8,
  },
  dayNumberDark: {
    color: '#60A5FA',
  },
  todayNumber: {
    color: '#0369A1',
    fontWeight: '700',
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
