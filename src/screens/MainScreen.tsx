import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState, useEffect } from 'react';
import { Datanames } from '../../data/datanames';

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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
// Navigation imports not used with custom bottom nav
import { TotalCelebrationsScreen } from './TotalCelebrationsScreen';
import { WeekScreen } from './WeekScreen';
import { AddSchemaScreen } from './AddSchemaScreen';
import { SettingsScreen } from './SettingsScreen';

function DayScreenContent() {
  const formatDate = () =>
    new Date().toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const [dateString, setDateString] = useState(formatDate());
  const [namesToday, setNamesToday] = useState<string[]>([]);
  const [celebrationToday, setCelebrationToday] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: any;
    const findNamedayLocal = (dt: Date) => {
      const monthName = GREEK_MONTHS[dt.getMonth()];
      const dayNum = dt.getDate();
      return Datanames.find(e => e.month === monthName && e.day === dayNum);
    };
    const applyUpdate = () => {
      const now = new Date();
      setDateString(formatDate());
      const entry = findNamedayLocal(now);
      setNamesToday(entry?.names ?? []);
      setCelebrationToday(entry?.celebrations?.[0] ?? null);
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
  }, []);

  const images = [
    require('../../img/OIP.jpg'),
    require('../../img/OIP (1).jpg'),
    require('../../img/OIP (2).jpg'),
    require('../../img/OIP (3).jpg'),
    require('../../img/OIP (4).jpg'),
    require('../../img/OIP (5).jpg'),
    require('../../img/OIP (6).jpg'),
    require('../../img/OIP (7).jpg'),
  ];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.heroWrap}>
        <Image source={randomImage} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <Text style={styles.heroDate}>{dateString}</Text>
            {celebrationToday ? (
              <Text style={styles.heroCelebration}>{celebrationToday}</Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.celebrationBox}>
          <Image
            source={require('../../assets/candle.jpg')}
            style={styles.candleIcon}
          />
          <View style={styles.textColumn}>
            <Text style={styles.label}>Εορτές σήμερα:</Text>
            {namesToday.length ? (
              <Text style={styles.namesList}>{namesToday.join(', ')}</Text>
            ) : (
              <Text style={styles.placeholder}>—</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function TopBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top }]}>
      <View style={styles.topLeft}>
        <TouchableOpacity accessibilityRole="button">
          <Ionicons name="calendar-outline" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.topTitle}>Εορτολόγιο</Text>
      <View style={styles.topRight}>
        <TouchableOpacity accessibilityRole="button" style={styles.iconButton}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// getTabIcon: not used with custom bottom nav

const colors = {
  primary: '#1E6AC7',
  bgSecondary: '#F3F4F6',
};

export default function MainScreen() {
  const [currentScreen, setCurrentScreen] = useState<
    'day' | 'month' | 'week' | 'close' | 'settings'
  >('day');

  const renderCurrent = () => {
    switch (currentScreen) {
      case 'day':
        return <DayScreenContent />;
      case 'month':
        return <TotalCelebrationsScreen />;
      case 'week':
        return <WeekScreen />;
      case 'close':
        return <AddSchemaScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DayScreenContent />;
    }
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <TopBar />
          <View style={styles.contentArea}>{renderCurrent()}</View>
          <View
            style={[styles.bottomNav, { backgroundColor: colors.bgSecondary }]}
          >
            {[
              ['Ημέρα', 'home-outline', 'day'],
              ['Μήνας', 'calendar-month-outline', 'month'],
              ['Εβδομάδα', 'calendar-week-outline', 'week'],
              ['Στενοί', 'account-group-outline', 'close'],
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
                  color={currentScreen === screen ? colors.primary : '#6b7280'}
                />
                <Text
                  style={{
                    color:
                      currentScreen === screen ? colors.primary : '#6b7280',
                    marginTop: 4,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentArea: {
    flex: 1,
  },
  topBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  topLeft: {
    width: 56,
    alignItems: 'center',
  },
  topRight: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 14,
  },
  topTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  heroWrap: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    color: '#fff',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  namesList: {
    fontSize: 14,
    color: '#374151',
  },
  heroDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
  celebrationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12, // ✅ όλες οι γωνίες ίδιες
  },

  textColumn: {
    flex: 1,
  },
  candleIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});
