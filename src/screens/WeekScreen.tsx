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
  primaryColor,
  primaryColorLight,
  addAlpha,
}: {
  item: DayInfo;
  darkMode?: boolean;
  effectiveTextColor?: string;
  getContactsForNameday: (names: string[]) => any[];
  getMyPeopleForNameday: (names: string[]) => any[];
  myPeopleData: any[];
  hasPermission: boolean;
  primaryColor: string;
  primaryColorLight: string;
  addAlpha: (color: string, alpha: number) => string;
}) => {
  const { isToday, weekday, names, celebrations, worldDays, dateObj, day, monthIndex } = item;
  const monthGenitive = GREEK_MONTHS_GENITIVE[monthIndex];
  const displayDate = `${String(day).padStart(2, '0')} ${monthGenitive}`;

  const contacts = useMemo(() => {
    return hasPermission && names.length > 0
      ? getContactsForNameday(names)
      : [];
  }, [hasPermission, names, getContactsForNameday]);

  const myPeople = useMemo(() => {
    // Get my people from nameday
    const namedayMembers = names.length > 0 ? getMyPeopleForNameday(names) : [];
    // Get my people from custom birthday/date
    const customMembers = getMyPeopleCelebratingOnDate(dateObj, myPeopleData);

    // Merge and remove duplicates
    const merged = [...namedayMembers];
    customMembers.forEach(cm => {
      if (!merged.find(amp => amp.id === cm.id)) {
        merged.push(cm);
      }
    });

    return merged;
  }, [names, dateObj, myPeopleData, getMyPeopleForNameday]);

  const headerTextColor = isToday
    ? primaryColor
    : darkMode
    ? primaryColorLight
    : primaryColor;
  const headerTextStyle = useMemo(() => ({ color: headerTextColor }), [headerTextColor]);

  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle,
    darkMode && !isToday && styles.sectionTitleDark,
    {
      color: isToday
        ? primaryColor
        : darkMode
        ? primaryColorLight
        : primaryColor,
    },
  ], [darkMode, isToday, primaryColor, primaryColorLight]);

  const textColorStyle = useMemo(() => ({
    color: effectiveTextColor
  }), [effectiveTextColor]);

  const dynamicContactItemStyle = useMemo(() => ({
    backgroundColor: darkMode ? '#374151' : addAlpha(primaryColor, 0.08),
    borderColor: addAlpha(primaryColor, 0.15),
    borderWidth: 1,
  }), [darkMode, primaryColor, addAlpha]);

  return (
    <View
      style={[
        styles.dayCard,
        {
          backgroundColor: isToday 
            ? addAlpha(primaryColor, darkMode ? 0.2 : 0.15) 
            : (darkMode ? '#1A2332' : addAlpha(primaryColor, 0.05)),
          borderColor: isToday 
            ? primaryColor 
            : (darkMode ? '#374151' : addAlpha(primaryColor, 0.15)),
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.dayHeader}>
        <Text
          style={[
            styles.dayName,
            isToday && { color: primaryColor },
            headerTextStyle,
          ]}
        >
          {weekday}
        </Text>
        <Text
          style={[
            styles.dayDate,
            isToday && { color: primaryColor, fontWeight: '600' },
            headerTextStyle,
          ]}
        >
          {displayDate}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={sectionTitleStyle}>
          Ονόματα:
        </Text>
        <Text style={[styles.namesText, darkMode && !isToday && styles.namesTextDark, textColorStyle]}>
          {names.length > 0 && names[0] !== 'NULL' ? names.join(', ') : '—'}
        </Text>
      </View>

      {celebrations.length > 0 && celebrations[0] !== 'NULL' && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
            Εορτές:
          </Text>
          {celebrations.map((celebration, index) => (
            <Text key={index} style={[styles.celebrationText, darkMode && !isToday && styles.celebrationTextDark, textColorStyle]}>
              • {celebration}
            </Text>
          ))}
        </View>
      )}

      {worldDays.length > 0 && (
        <View style={styles.section}>
          <Text style={sectionTitleStyle}>
            Παγκόσμιες ημέρες:
          </Text>
          {worldDays.map((wd, index) => (
            <Text key={index} style={[styles.celebrationText, darkMode && !isToday && styles.celebrationTextDark, textColorStyle]}>
              • {wd}
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
              <TouchableOpacity 
                key={contact.recordID} 
                style={[styles.contactItem, dynamicContactItemStyle]}
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
                <Text style={[styles.contactName, darkMode && !isToday && styles.namesTextDark, textColorStyle]}>
                  {contact.displayName}
                </Text>
              </TouchableOpacity>
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
                    { text: 'Κλείσιμο', style: 'cancel' as any },
                  ];
                  Alert.alert(
                    formatMyPersonCelebration(member),
                    'Επιλέξτε ενέργεια:',
                    buttons,
                    { cancelable: true },
                  );
                }}
              >
                <Text
                  style={[
                    styles.contactName,
                    darkMode && !isToday && styles.namesTextDark,
                    textColorStyle,
                  ]}
                >
                  {formatMyPersonCelebration(member)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {names.length === 0 && celebrations.length === 0 && worldDays.length === 0 && (
        <Text style={styles.noData}>Δεν υπάρχουν αναγραφές</Text>
      )}
    </View>
  );
});

export const WeekScreen = ({
  dbMonthFests,
  dbMonthWorldDays,
}: {
  dbMonthFests?: Fest[];
  dbMonthWorldDays?: WorldDay[];
}) => {
  const {
    globalDaysEnabled,
    darkModeEnabled,
    backgroundColor,
    effectiveTextColor,
    selectedYear,
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
  const [dbFests, setDbFests] = useState<Fest[]>(dbMonthFests || []);
  const [dbWorldDays, setDbWorldDays] = useState<WorldDay[]>(dbMonthWorldDays || []);
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
    const fetchSQLiteData = async () => {
      try {
        const currentMonthName = GREEK_MONTHS[today.getMonth()];
        const month1 = GREEK_MONTHS[startOfCurrentWeek.getMonth()];
        const endDay = new Date(startOfCurrentWeek);
        endDay.setDate(startOfCurrentWeek.getDate() + numDays);
        const month2 = GREEK_MONTHS[endDay.getMonth()];

        let fests: Fest[] = dbMonthFests ? [...dbMonthFests] : [];
        let wDays: WorldDay[] = dbMonthWorldDays ? [...dbMonthWorldDays] : [];

        // Fetch month1 if it's different from the current month
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
        
        setDbFests(fests);
        setDbWorldDays(wDays);
      } catch (err) {
        console.error('Error fetching week SQLite data:', err);
      }
    };

    fetchSQLiteData();
  }, [startOfCurrentWeek, numDays, globalDaysEnabled, dbMonthFests, dbMonthWorldDays, today]);

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
      
      const dbFest = dbFests.find(f => 
        f.month?.trim() === monthName?.trim() && Number(f.day) === dayNum
      );
      const dbWorldDayMatches = dbWorldDays.filter(w => 
        w.month?.trim() === monthName?.trim() && Number(w.day) === dayNum
      );

      let names = c.names;
      let celebs = c.celebrations;
      let wds = c.worldDays;

      if (dbFest) {
        const remoteNames = dbFest.names ? (dbFest.names as string).split(',').map(n => n.trim()) : [];
        const remoteCelebs = dbFest.celebrations ? (dbFest.celebrations as string).split(',').map(c => c.trim()) : [];
        
        names = Array.from(new Set([...c.names, ...remoteNames]));
        celebs = Array.from(new Set([...c.celebrations, ...remoteCelebs]));
      }

      if (dbWorldDayMatches.length > 0) {
        const titles = dbWorldDayMatches.map(w => w.title).filter(Boolean) as string[];
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
  }, [startOfCurrentWeek, numDays, globalDaysEnabled, dbFests, dbWorldDays, selectedYear, today]);

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
            primaryColor={primaryColor}
            primaryColorLight={primaryColorLight}
            addAlpha={addAlpha}
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  containerDark: {
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  titleDark: {
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  subtitleDark: {
  },
  weekContent: {
    marginBottom: 20,
  },
  dayCard: {
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
  },
  dayCardDark: {
  },
  dayHeader: {
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
  },
  dayNameDark: {
  },
  dayDate: {
    fontSize: 12,
    marginTop: 2,
  },
  dayDateDark: {
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
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
    marginBottom: 4,
  },
  sectionTitleDark: {
  },
  namesText: {
    fontSize: 13,
    fontWeight: '500',
  },
  namesTextDark: {
  },
  celebrationText: {
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 4,
  },
  celebrationTextDark: {
  },
  noData: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
  },
});
