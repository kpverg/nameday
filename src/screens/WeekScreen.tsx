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
  GREEK_MONTHS,
} from '../services/namedayService';
import {
  getMyPeopleCelebratingOnDate,
  formatMyPersonCelebration,
} from '../services/myPeopleCelebrationService';
import { getFestsByMonth } from '../services/apiservices/totalMonthFests';
import { getWorldDaysByMonth } from '../services/apiservices/worldday';
import type { Fest } from '../types/fest';
import type { WorldDay } from '../services/apiservices/worldday';

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

      <View style={styles.section}>
        <Text style={sectionTitleStyle}>
          Ονόματα:
        </Text>
        <Text style={[styles.namesText, darkMode && !item.isToday && styles.namesTextDark, textColorStyle]}>
          {item.names.length > 0 && item.names[0] !== 'NULL' ? item.names.join(', ') : '—'}
        </Text>
      </View>

      {item.celebrations.length > 0 && item.celebrations[0] !== 'NULL' && (
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

export const WeekScreen = ({
  supabaseMonthFests,
  supabaseMonthWorldDays,
}: {
  supabaseMonthFests?: Fest[];
  supabaseMonthWorldDays?: WorldDay[];
}) => {
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
  const [supabaseFests, setSupabaseFests] = useState<Fest[]>(supabaseMonthFests || []);
  const [supabaseWorldDays, setSupabaseWorldDays] = useState<WorldDay[]>(supabaseMonthWorldDays || []);
  const flatListRef = useRef<FlatList>(null);
  const hasInitialScrolled = useRef(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Get Sunday of the current week (0 is Sunday)
  const startOfCurrentWeek = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay());
    return d;
  }, [today]);

  const numDays = useMemo(() => today.getDay() + 1 + 7, [today]);

  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const currentMonthName = GREEK_MONTHS[today.getMonth()];
        const month1 = GREEK_MONTHS[startOfCurrentWeek.getMonth()];
        const endDay = new Date(startOfCurrentWeek);
        endDay.setDate(startOfCurrentWeek.getDate() + numDays);
        const month2 = GREEK_MONTHS[endDay.getMonth()];

        let fests: Fest[] = supabaseMonthFests ? [...supabaseMonthFests] : [];
        let wDays: WorldDay[] = supabaseMonthWorldDays ? [...supabaseMonthWorldDays] : [];

        // Fetch month1 if it's different from the current month (which is what supabaseMonthFests has)
        if (month1 !== currentMonthName) {
          const f1 = await getFestsByMonth(month1);
          fests = [...fests, ...f1];
          if (globalDaysEnabled) {
            const w1 = await getWorldDaysByMonth(month1);
            wDays = [...wDays, ...w1];
          }
        }

        // Fetch month2 if it's different from month1 AND different from the current month
        if (month1 !== month2 && month2 !== currentMonthName) {
          const f2 = await getFestsByMonth(month2);
          fests = [...fests, ...f2];
          if (globalDaysEnabled) {
            const w2 = await getWorldDaysByMonth(month2);
            wDays = [...wDays, ...w2];
          }
        }
        
        setSupabaseFests(fests);
        setSupabaseWorldDays(wDays);
      } catch (err) {
        console.error('Error fetching week supabase data:', err);
      }
    };

    fetchSupabaseData();
  }, [startOfCurrentWeek, numDays, globalDaysEnabled, supabaseMonthFests, supabaseMonthWorldDays, today]);

  const weekData = useMemo<DayInfo[]>(() => {
    const celebrations = getWeekCelebrations(
      startOfCurrentWeek,
      selectedYear || today.getFullYear(),
      globalDaysEnabled,
      numDays,
    );

    return celebrations.map((c, index) => {
      const dateObj = new Date(startOfCurrentWeek);
      dateObj.setDate(startOfCurrentWeek.getDate() + index);

      const monthName = GREEK_MONTHS[dateObj.getMonth()];
      const dayNum = dateObj.getDate();
      
      const remoteFest = supabaseFests.find(f => 
        f.month?.trim() === monthName?.trim() && Number(f.day) === dayNum
      );
      const remoteWDs = supabaseWorldDays.filter(w => 
        w.month?.trim() === monthName?.trim() && Number(w.day) === dayNum
      );

      let names = c.names;
      let celebs = c.celebrations;
      let wds = c.worldDays;

      if (remoteFest) {
        const remoteNames = remoteFest.names ? (remoteFest.names as string).split(',').map(n => n.trim()) : [];
        const remoteCelebs = remoteFest.celebrations ? (remoteFest.celebrations as string).split(',').map(c => c.trim()) : [];
        
        names = Array.from(new Set([...c.names, ...remoteNames]));
        celebs = Array.from(new Set([...c.celebrations, ...remoteCelebs]));
      }

      if (remoteWDs.length > 0) {
        const titles = remoteWDs.map(w => w.title).filter(Boolean) as string[];
        if (titles.length > 0) wds = titles;
      }

      return {
        ...c,
        names,
        celebrations: celebs,
        worldDays: wds,
        dateObj,
      };
    });
  }, [startOfCurrentWeek, numDays, globalDaysEnabled, supabaseFests, supabaseWorldDays, selectedYear, today]);

  useEffect(() => {
    // Scroll to today only once and without animation
    if (!hasInitialScrolled.current && weekData.length > 0) {
      const currentDayOfWeek = today.getDay();
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
  }, [weekData, today]);

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
