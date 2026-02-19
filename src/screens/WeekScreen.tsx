import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../AppContext';
import { useContacts } from '../ContactsContext';
import {
  GREEK_MONTHS_GENITIVE,
  getWeekCelebrations,
} from '../services/namedayService';
import {
  getMyPeopleCelebratingOnDate,
  formatMyPersonCelebration,
} from '../services/myPeopleCelebrationService';

interface DayInfo {
  weekday: string;
  day: number;
  monthIndex: number;
  names: string[];
  celebrations: string[];
  worldDays: string[];
  isToday: boolean;
  dateObj: Date;
}

const DayCard = React.memo(({
  item,
  darkMode,
  effectiveTextColor,
  getContactsForNameday,
  getMyPeopleForNameday,
  myPeopleData,
  hasPermission,
}: {
  item: DayInfo;
  darkMode?: boolean;
  effectiveTextColor?: string;
  getContactsForNameday: (names: string[]) => any[];
  getMyPeopleForNameday: (names: string[]) => any[];
  myPeopleData: any[];
  hasPermission: boolean;
}) => {
  const monthGenitive = GREEK_MONTHS_GENITIVE[item.monthIndex];
  const displayDate = `${String(item.day).padStart(2, '0')} ${monthGenitive}`;

  const contacts = useMemo(() => {
    return hasPermission && item.names.length > 0
      ? getContactsForNameday(item.names)
      : [];
  }, [hasPermission, item.names, getContactsForNameday]);

  const myPeople = useMemo(() => {
    // Get my people from nameday
    const namedayMembers = item.names.length > 0 ? getMyPeopleForNameday(item.names) : [];
    // Get my people from custom birthday/date
    const customMembers = getMyPeopleCelebratingOnDate(item.dateObj, myPeopleData);

    // Merge and remove duplicates
    const merged = [...namedayMembers];
    customMembers.forEach(cm => {
      if (!merged.find(amp => amp.id === cm.id)) {
        merged.push(cm);
      }
    });

    return merged;
  }, [item.names, item.dateObj, myPeopleData, getMyPeopleForNameday]);

  const headerTextColor = item.isToday ? '#0B1220' : effectiveTextColor;
  const headerTextStyle = useMemo(() => ({ color: headerTextColor }), [headerTextColor]);

  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle,
    darkMode && !item.isToday && styles.sectionTitleDark,
    item.isToday ? styles.textBlack : styles.textBlue
  ], [darkMode, item.isToday]);

  const textColorStyle = useMemo(() => ({
    color: item.isToday ? '#0B1220' : effectiveTextColor
  }), [item.isToday, effectiveTextColor]);

  return (
    <View
      style={[
        styles.dayCard,
        darkMode && !item.isToday && styles.dayCardDark,
        item.isToday && styles.dayCardToday,
      ]}
    >
      <View style={styles.dayHeader}>
        <Text style={[styles.dayName, item.isToday && styles.dayNameToday, headerTextStyle]}>
          {item.weekday}
        </Text>
        <Text style={[styles.dayDate, item.isToday && styles.dayDateToday, headerTextStyle]}>
          {displayDate}
        </Text>
      </View>

      {item.names.length > 0 && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
            Ονόματα:
          </Text>
          <Text style={[styles.namesText, darkMode && !item.isToday && styles.namesTextDark, textColorStyle]}>
            {item.names.join(', ')}
          </Text>
        </View>
      )}

      {item.celebrations.length > 0 && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
            Εορτές:
          </Text>
          {item.celebrations.map((celebration, index) => (
            <Text key={index} style={[styles.celebrationText, darkMode && !item.isToday && styles.celebrationTextDark, textColorStyle]}>
              • {celebration}
            </Text>
          ))}
        </View>
      )}

      {item.worldDays.length > 0 && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
            Παγκόσμιες ημέρες:
          </Text>
          {item.worldDays.map((day, index) => (
            <Text key={index} style={[styles.celebrationText, darkMode && !item.isToday && styles.celebrationTextDark, textColorStyle]}>
              • {day}
            </Text>
          ))}
        </View>
      )}

      {contacts.length > 0 && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
            Επαφές που γιορτάζουν:
          </Text>
          <View style={styles.contactsRow}>
            {contacts.map((contact) => (
              <View key={contact.recordID} style={styles.contactItem}>
                <Text style={[styles.contactName, darkMode && !item.isToday && styles.namesTextDark, textColorStyle]}>
                  {contact.displayName}
                </Text>
                {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                  <View style={styles.contactActions}>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phoneNumbers[0].number}`)} style={styles.actionButton}>
                      <Ionicons name="call" size={14} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`sms:${contact.phoneNumbers[0].number}`)} style={styles.actionButton}>
                      <Ionicons name="mail" size={14} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {myPeople.length > 0 && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
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
                          { text: '📞 Κλήση', onPress: () => Linking.openURL(`tel:${member.phoneNumber}`) },
                          { text: '✉️ SMS', onPress: () => Linking.openURL(`sms:${member.phoneNumber}`) },
                        ]
                      : []),
                    { text: 'Κλείσιμο', style: 'cancel' as any },
                  ];
                  Alert.alert(formatMyPersonCelebration(member), 'Επιλέξτε ενέργεια:', buttons, { cancelable: true });
                }}
              >
                <Text style={[styles.contactName, darkMode && !item.isToday && styles.namesTextDark, textColorStyle]}>
                  {formatMyPersonCelebration(member)}
                </Text>
                {member.phoneNumber && (
                  <View style={styles.contactActions}>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${member.phoneNumber}`)} style={styles.actionButton}>
                      <Ionicons name="call" size={14} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`sms:${member.phoneNumber}`)} style={styles.actionButton}>
                      <Ionicons name="mail" size={14} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {item.names.length === 0 && item.celebrations.length === 0 && item.worldDays.length === 0 && (
        <Text style={styles.noData}>Δεν υπάρχουν αναγραφές</Text>
      )}
    </View>
  );
});

export const WeekScreen = () => {
  const {
    globalDaysEnabled,
    darkModeEnabled,
    backgroundColor,
    effectiveTextColor,
    selectedYear,
  } = useAppContext();
  const {
    hasPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    myPeople,
  } = useContacts();
  const [weekData, setWeekData] = useState<DayInfo[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const hasInitialScrolled = useRef(false);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get Sunday of the current week (0 is Sunday)
    const currentDayOfWeek = today.getDay();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek);

    // Number of days: From Sunday to today, plus 7 days after today
    const numDays = currentDayOfWeek + 1 + 7;

    const celebrations = getWeekCelebrations(
      startOfCurrentWeek,
      selectedYear || today.getFullYear(),
      globalDaysEnabled,
      numDays,
    );

    const weekDays: DayInfo[] = celebrations.map((c, index) => {
      const dateObj = new Date(startOfCurrentWeek);
      dateObj.setDate(startOfCurrentWeek.getDate() + index);

      return {
        ...c,
        dateObj,
      };
    });

    setWeekData(weekDays);

    // Scroll to today only once and without animation
    if (!hasInitialScrolled.current) {
      setTimeout(() => {
        if (flatListRef.current && currentDayOfWeek !== -1) {
          flatListRef.current.scrollToIndex({
            index: currentDayOfWeek,
            animated: false,
            viewPosition: 0,
          });
          hasInitialScrolled.current = true;
        }
      }, 100);
    }
  }, [
    globalDaysEnabled,
    hasPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    selectedYear,
    myPeople,
  ]);

  return (
    <View
      style={[
        styles.container,
        darkModeEnabled && styles.containerDark,
        !darkModeEnabled && { backgroundColor: backgroundColor },
      ]}
    >
      <FlatList
        ref={flatListRef}
        ListHeaderComponent={
          <>
            <Text
              style={[
                styles.title,
                darkModeEnabled && styles.titleDark,
                { color: effectiveTextColor },
              ]}
            >
              Εβδομάδα
            </Text>
            <Text
              style={[styles.subtitle, darkModeEnabled && styles.subtitleDark]}
            >
              Εορτές εβδομάδας και επόμενων 7 ημερών
            </Text>
          </>
        }
        data={weekData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <DayCard
            item={item}
            darkMode={darkModeEnabled}
            effectiveTextColor={effectiveTextColor}
            getContactsForNameday={getContactsForNameday}
            getMyPeopleForNameday={getMyPeopleForNameday}
            myPeopleData={myPeople}
            hasPermission={hasPermission}
          />
        )}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });
        }}
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
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  weekContent: {
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
    borderLeftColor: '#1E6AC7',
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  dayCardDark: {
    backgroundColor: '#1F2937',
    borderLeftColor: '#60A5FA',
  },
  dayCardToday: {
    backgroundColor: '#DBEAFE',
    borderLeftColor: '#0EA5E9',
  },
  dayHeader: {
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E6AC7',
  },
  dayNameDark: {
    color: '#60A5FA',
  },
  dayNameToday: {
    color: '#0EA5E9',
  },
  dayDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  dayDateDark: {
    color: '#9CA3AF',
  },
  dayDateToday: {
    color: '#0284C7',
    fontWeight: '600',
  },
  section: {
    marginBottom: 10,
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    marginRight: 6,
    marginBottom: 4,
  },
  contactActions: {
    flexDirection: 'row',
    marginLeft: 4,
    gap: 3,
  },
  actionButton: {
    padding: 2,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '500',
  },
  myPeopleMemberInfo: {
    flexDirection: 'column',
  },
  myPeopleLabel: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  sectionTitleDark: {
    color: '#9CA3AF',
  },
  namesText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  namesTextDark: {
    color: '#E5E7EB',
  },
  celebrationText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 4,
  },
  celebrationTextDark: {
    color: '#E5E7EB',
  },
  noData: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  textBlack: {
    color: '#0B1220',
  },
  textBlue: {
    color: '#1E6AC7',
  },
  listContent: {
    paddingBottom: 20,
  },
});
