import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useContacts } from '../ContactsContext';
import {
  GREEK_MONTHS_GENITIVE,
  getWeekCelebrations,
} from '../services/namedayService';

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
  myPeople: any[];
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
      {
        // Use a contrasting text color for today's card so it remains readable
      }
      {(() => {
        const headerTextColor = item.isToday ? '#0B1220' : effectiveTextColor;
        const bodyTextColor = item.isToday ? '#0B1220' : effectiveTextColor;
        return (
          <>
            <Text
              style={[
                styles.dayName,
                item.isToday && styles.dayNameToday,
                { color: headerTextColor },
              ]}
            >
              {item.weekday}
            </Text>
            <Text
              style={[
                styles.dayDate,
                item.isToday && styles.dayDateToday,
                { color: headerTextColor },
              ]}
            >
              {item.date}
            </Text>
          </>
        );
      })()}
    </View>

    {item.names.length > 0 && (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            darkMode && styles.sectionTitleDark,
            { color: item.isToday ? '#0B1220' : effectiveTextColor },
          ]}
        >
          Ονόματα:
        </Text>
        <Text
          style={[
            styles.namesText,
            darkMode && styles.namesTextDark,
            { color: item.isToday ? '#0B1220' : effectiveTextColor },
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
            { color: item.isToday ? '#0B1220' : effectiveTextColor },
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
              { color: item.isToday ? '#0B1220' : effectiveTextColor },
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
            { color: item.isToday ? '#0B1220' : effectiveTextColor },
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
              { color: item.isToday ? '#0B1220' : effectiveTextColor },
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
                  { color: item.isToday ? '#0B1220' : effectiveTextColor },
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

    {item.myPeople && item.myPeople.length > 0 && (
      <View style={styles.section}>
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
          {item.myPeople.map((member: any) => (
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
                            Linking.openURL(`tel:${member.phoneNumber}`),
                        },
                        {
                          text: '✉️ SMS',
                          onPress: () =>
                            Linking.openURL(`sms:${member.phoneNumber}`),
                        },
                      ]
                    : []),
                  {
                    text: 'Κλείσιμο',
                    style: 'cancel' as any,
                  },
                ];
                Alert.alert(
                  member.name,
                  `${member.relation}`,
                  buttons,
                  { cancelable: true },
                );
              }}
            >
              <Text
                style={[
                  styles.contactName,
                  darkMode && styles.namesTextDark,
                  { color: item.isToday ? '#0B1220' : effectiveTextColor },
                ]}
              >
                {member.name}
              </Text>
            </TouchableOpacity>
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
    selectedYear,
  } = useAppContext();
  const { hasPermission, getContactsForNameday, getMyPeopleForNameday } =
    useContacts();
  const [weekData, setWeekData] = useState<DayInfo[]>([]);

  useEffect(() => {
    const today = new Date();
    const celebrations = getWeekCelebrations(
      today,
      selectedYear || today.getFullYear(),
      globalDaysEnabled,
    );

    const weekDays: DayInfo[] = celebrations.map(c => {
      const monthGenitive = GREEK_MONTHS_GENITIVE[c.monthIndex];
      return {
        ...c,
        date: `${String(c.day).padStart(2, '0')} ${monthGenitive}`,
        month: '', // Not used in view
        contacts:
          hasPermission && c.names.length > 0
            ? getContactsForNameday(c.names)
            : [],
        myPeople:
          c.names.length > 0 ? getMyPeopleForNameday(c.names) : [],
      };
    });

    setWeekData(weekDays);
  }, [
    globalDaysEnabled,
    hasPermission,
    getContactsForNameday,
    getMyPeopleForNameday,
    selectedYear,
  ]);

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
});
