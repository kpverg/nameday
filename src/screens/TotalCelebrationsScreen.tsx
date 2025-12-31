import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState, useRef } from 'react';
import { Datanames } from '../../data/datanames';
import { getMovableNamedayEntries } from '../../data/movingCelebrations';
import { worldDaysJanFeb } from '../../data/worldday';
import { useAppContext } from '../AppContext';

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

const DayItem = ({
  day,
  celebrations,
  names,
  worldDays,
  isToday,
  year,
  monthIndex,
  monthNameGenitive,
  darkMode,
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
}) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(year, monthIndex, day);
  const weekdayName = GREEK_WEEKDAYS[date.getDay()];
  const dayFormatted = String(day).padStart(2, '0');

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.dayContainer,
        isToday && styles.todayContainer,
        darkMode && styles.dayContainerDark,
      ]}
    >
      <View style={styles.dayHeader}>
        <Text
          style={[
            styles.dayNumber,
            isToday && styles.todayNumber,
            darkMode && styles.dayNumberDark,
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
                ]}
              >
                Ονόματα:
              </Text>
              <Text
                style={[styles.namesText, darkMode && styles.namesTextDark]}
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
                  ]}
                >
                  • {worldDay}
                </Text>
              ))}
            </View>
          )}
          {names.length === 0 &&
            celebrations.length === 0 &&
            worldDays.length === 0 && (
              <Text
                style={[
                  styles.noCelebrationsText,
                  darkMode && styles.noCelebrationsTextDark,
                ]}
              >
                Δεν υπάρχουν γιορτές
              </Text>
            )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const TotalCelebrationsScreen = () => {
  const { globalDaysEnabled, darkModeEnabled, selectedYear } = useAppContext();
  const now = new Date();
  const [displayMonthIndex, setDisplayMonthIndex] = useState<number>(
    now.getMonth(),
  );
  const lastScrollTime = useRef(0);
  const scrollDelay = 300; // milliseconds

  // Calculate the month to display
  const displayDate = new Date(selectedYear, displayMonthIndex, 1);
  const displayYear = displayDate.getFullYear();
  const monthName = GREEK_MONTHS[displayMonthIndex];

  // Get all celebrations for the display month
  const monthData = Datanames.filter(entry => entry.month === monthName);
  const movingEntries = getMovableNamedayEntries(displayYear).filter(
    e => e.month === monthName,
  );

  // Create a map for quick lookup
  const celebrationsByDay: Record<number, string[]> = {};
  monthData.forEach(entry => {
    if (!celebrationsByDay[entry.day]) {
      celebrationsByDay[entry.day] = [];
    }
    celebrationsByDay[entry.day].push(...(entry.celebrations || []));
  });
  // Include movable feasts celebrations
  movingEntries.forEach(entry => {
    if (!celebrationsByDay[entry.day]) {
      celebrationsByDay[entry.day] = [];
    }
    celebrationsByDay[entry.day].push(...(entry.celebrations || []));
  });

  // Find world days for the display month
  const findWorldDaysForDay = (
    dayNum: number,
    displayMonthName: string,
  ): string[] => {
    if (!globalDaysEnabled) return [];
    const dayString = `${dayNum} ${displayMonthName}`;
    return worldDaysJanFeb
      .filter(wd => wd.date === dayString || wd.date.includes(dayString))
      .map(wd => wd.title);
  };

  // Get the last day of the display month
  const lastDay = new Date(displayYear, displayMonthIndex + 1, 0).getDate();

  // Check if today is in the display month
  const isCurrentMonth =
    displayMonthIndex === now.getMonth() && displayYear === now.getFullYear();
  const today = now.getDate();

  // Create list of days
  const daysData = Array.from({ length: lastDay }, (_, i) => {
    const dayNum = i + 1;
    const dayEntry = Datanames.find(
      entry => entry.month === monthName && entry.day === dayNum,
    );
    const movingEntry = movingEntries.find(e => e.day === dayNum);
    return {
      day: dayNum,
      celebrations: celebrationsByDay[dayNum] || [],
      names: [...(dayEntry?.names || []), ...(movingEntry?.names || [])],
      worldDays: findWorldDaysForDay(dayNum, monthName),
      isToday: isCurrentMonth && dayNum === today,
    };
  });

  const handlePrevMonth = () => {
    const now = Date.now();
    if (now - lastScrollTime.current < scrollDelay) return;
    lastScrollTime.current = now;
    setDisplayMonthIndex(prev => (prev - 1 < 0 ? 0 : prev - 1));
  };

  const handleNextMonth = () => {
    const now = Date.now();
    if (now - lastScrollTime.current < scrollDelay) return;
    lastScrollTime.current = now;
    setDisplayMonthIndex(prev => (prev + 1 > 11 ? 11 : prev + 1));
  };

  return (
    <View style={[styles.container, darkModeEnabled && styles.containerDark]}>
      <View style={[styles.header, darkModeEnabled && styles.headerDark]}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={darkModeEnabled ? '#60A5FA' : '#1E6AC7'}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, darkModeEnabled && styles.titleDark]}>
            Οι εορτές του μήνα
          </Text>
          <Text
            style={[styles.subtitle, darkModeEnabled && styles.subtitleDark]}
          >
            {monthName}
          </Text>
          <Text
            style={[styles.yearText, darkModeEnabled && styles.yearTextDark]}
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
          />
        )}
        keyExtractor={item => String(item.day)}
        scrollEnabled={true}
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E6AC7',
    marginBottom: 6,
  },
  sectionTitleDark: {
    color: '#60A5FA',
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
