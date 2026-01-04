import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { Datanames } from '../../data/datanames';
import { worldDaysJanFeb } from '../../data/worldday';
import { useAppContext } from '../AppContext';
import { useContacts } from '../ContactsContext';

const GREEK_MONTHS = [
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος',
];

const GREEK_MONTHS_GENITIVE = [
  'Ιανουαρίου',
  'Φεβρουαρίου',
  'Μαρτίου',
  'Απριλίου',
  'Μαΐου',
  'Ιουνίου',
  'Ιουλίου',
  'Αυγούστου',
  'Σεπτεμβρίου',
  'Οκτωβρίου',
  'Νοεμβρίου',
  'Δεκεμβρίου',
];

const GREEK_WEEKDAYS = [
  'Κυριακή',
  'Δευτέρα',
  'Τρίτη',
  'Τετάρτη',
  'Πέμπτη',
  'Παρασκευή',
  'Σάββατο',
];

interface DayInfo {
  weekday: string;
  date: string;
  day: number;
  month: string;
  names: string[];
  celebrations: string[];
  worldDays: string[];
  isToday: boolean;
  contacts: any[];
}

const DayCard = ({
  item,
  darkMode,
  effectiveTextColor,
}: {
  item: DayInfo;
  darkMode?: boolean;
  effectiveTextColor?: string;
}) => (
  <View
    style={[
      styles.dayCard,
      darkMode && !item.isToday && styles.dayCardDark,
      item.isToday && styles.dayCardToday,
    ]}
  >
    <View style={styles.dayHeader}>
      <Text
        style={[
          styles.dayName,
          item.isToday && styles.dayNameToday,
          { color: effectiveTextColor },
        ]}
      >
        {item.weekday}
      </Text>
      <Text
        style={[
          styles.dayDate,
          item.isToday && styles.dayDateToday,
          { color: effectiveTextColor },
        ]}
      >
        {item.date}
      </Text>
    </View>

    {item.names.length > 0 && (
      <View style={styles.section}>
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
          {item.names.join(', ')}
        </Text>
      </View>
    )}

    {item.celebrations.length > 0 && (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            darkMode && styles.sectionTitleDark,
            { color: effectiveTextColor },
          ]}
        >
          Εορτές:
        </Text>
        {item.celebrations.map((celebration, index) => (
          <Text
            key={index}
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

    {item.worldDays.length > 0 && (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            darkMode && styles.sectionTitleDark,
            { color: effectiveTextColor },
          ]}
        >
          Παγκόσμιες ημέρες:
        </Text>
        {item.worldDays.map((day, index) => (
          <Text
            key={index}
            style={[
              styles.celebrationText,
              darkMode && styles.celebrationTextDark,
              { color: effectiveTextColor },
            ]}
          >
            • {day}
          </Text>
        ))}
      </View>
    )}

    {item.contacts && item.contacts.length > 0 && (
      <View style={styles.section}>
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
          {item.contacts.map((contact, index) => (
            <View key={contact.recordID} style={styles.contactItem}>
              <Text
                style={[
                  styles.contactName,
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
            </View>
          ))}
        </View>
      </View>
    )}

    {item.names.length === 0 &&
      item.celebrations.length === 0 &&
      item.worldDays.length === 0 && (
        <Text style={styles.noData}>Δεν υπάρχουν αναγραφές</Text>
      )}
  </View>
);

export const WeekScreen = () => {
  const {
    globalDaysEnabled,
    darkModeEnabled,
    backgroundColor,
    effectiveTextColor,
  } = useAppContext();
  const { hasPermission, getContactsForNameday } = useContacts();
  const [weekData, setWeekData] = useState<DayInfo[]>([]);

  useEffect(() => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const weekDays: DayInfo[] = [];

    const findWorldDaysForDate = (dt: Date): string[] => {
      const monthName = GREEK_MONTHS[dt.getMonth()];
      const dayNum = dt.getDate();
      const dayString = `${dayNum} ${monthName}`;
      return worldDaysJanFeb
        .filter(wd => wd.date === dayString || wd.date.includes(dayString))
        .map(wd => wd.title);
    };

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const monthName = GREEK_MONTHS[date.getMonth()];
      const dayNum = date.getDate();
      const weekday = GREEK_WEEKDAYS[date.getDay()];
      const monthGenitive = GREEK_MONTHS_GENITIVE[date.getMonth()];

      const entry = Datanames.find(
        e => e.month === monthName && e.day === dayNum,
      );

      const worldDays = globalDaysEnabled ? findWorldDaysForDate(date) : [];
      const names = entry?.names ?? [];
      const contactsCelebrating =
        hasPermission && names.length > 0 ? getContactsForNameday(names) : [];

      weekDays.push({
        weekday,
        date: `${String(dayNum).padStart(2, '0')} ${monthGenitive}`,
        day: dayNum,
        month: monthName,
        names,
        celebrations: entry?.celebrations ?? [],
        worldDays,
        contacts: contactsCelebrating,
        isToday:
          date.getFullYear() === todayYear &&
          date.getMonth() === todayMonth &&
          date.getDate() === todayDay,
      });
    }

    setWeekData(weekDays);
  }, [globalDaysEnabled, hasPermission, getContactsForNameday]);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: darkModeEnabled ? '#111827' : backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.title,
          darkModeEnabled && styles.titleDark,
          { color: effectiveTextColor },
        ]}
      >
        Εβδομάδα
      </Text>
      <Text style={[styles.subtitle, darkModeEnabled && styles.subtitleDark]}>
        Εορτές των επόμενων 7 ημερών
      </Text>
      <View style={styles.weekContent}>
        {weekData.map((day, index) => (
          <DayCard
            key={index}
            item={day}
            darkMode={darkModeEnabled}
            effectiveTextColor={effectiveTextColor}
          />
        ))}
      </View>
    </ScrollView>
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
});
