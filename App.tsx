/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  StatusBar,
  useColorScheme,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useAppContext } from './src/AppContext';
import { ContactsProvider } from './src/ContactsContext';
import MainScreen from './src/screens/MainScreen';
import SplashLoading from './src/SplashLoading';
import { useState, useEffect } from 'react';
import { useNotifications } from './src/useNotifications';
import { getTodayFests } from './src/services/apiservices/todayfest';
import { getFestsByMonth } from './src/services/apiservices/totalMonthFests';
import { getTodayWorldDays, getWorldDaysByMonth, WorldDay } from './src/services/apiservices/worldday';
import { executeQuery } from './src/services/sqliteService';
import type { Fest } from './src/types/fest';
import type { Saint } from './src/types/saint';

// Fallback inline splash in case import resolution misbehaves
function AppContent() {
  const { isLoading, backgroundColor, textColor, globalDaysEnabled, primaryColor } = useAppContext();
  const isDarkMode = useColorScheme() === 'dark';
  const [showApp, setShowApp] = useState(!isLoading);
  const [fests, setFests] = useState<Fest[]>([]);
  const [monthFests, setMonthFests] = useState<Fest[]>([]);
  const [worldDays, setWorldDays] = useState<WorldDay[]>([]);
  const [monthWorldDays, setMonthWorldDays] = useState<WorldDay[]>([]);
  const [todaySaints, setTodaySaints] = useState<Saint[]>([]);

  useNotifications(fests, worldDays, todaySaints); // Initialize notifications with remote data

  useEffect(() => {
    async function fetchFests() {
      try {
        const today = new Date();
        const currentDay = today.getDate().toString();
        const greekMonths = [
          'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
          'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
        ];
        const currentMonth = greekMonths[today.getMonth()];

        const data = await getTodayFests();
        if (data && data.length > 0) {
          setFests(data);
        }

        // Fetch today world days if enabled
        if (globalDaysEnabled) {
          const wd = await getTodayWorldDays();
          setWorldDays(wd);
        }

        // Fetch today saints from SQLite
        const saintsData = await executeQuery<Saint>(
          'SELECT * FROM saint WHERE TRIM(feast_day) = ? AND TRIM(feast_month) = ?',
          [currentDay.trim(), currentMonth.trim()]
        );
        
        if (saintsData) {
          console.log(`Found ${saintsData.length} saints for ${currentDay} ${currentMonth}`);
          saintsData.forEach(s => console.log(`Saint: ${s.name}, ID: ${s.id}, Image: ${s.image_url}`));
          setTodaySaints(saintsData);
        } else {
          console.log(`No saints found for ${currentDay} ${currentMonth}`);
        }

        const monthData = await getFestsByMonth(currentMonth);
        setMonthFests(monthData);

        // Fetch month world days if enabled
        if (globalDaysEnabled) {
          const monthWD = await getWorldDaysByMonth(currentMonth);
          setMonthWorldDays(monthWD);
        }

      } catch (err) {
        console.error('SQLite fetch error:', err);
      }
    }
    fetchFests();
  }, [globalDaysEnabled]);

  useEffect(() => {
    if (!isLoading) {
      setShowApp(true);
    }
  }, [isLoading]);

  if (!showApp) {
    return <SplashLoading onComplete={() => setShowApp(true)} primaryColor={primaryColor} textColor={textColor} />;
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MainScreen 
        dbFests={fests} 
        dbMonthFests={monthFests} 
        dbWorldDays={worldDays}
        dbMonthWorldDays={monthWorldDays}
        todaySaints={todaySaints}
      />
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ContactsProvider>
          <AppContent />
        </ContactsProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;

const stylesSplash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 10,
  },
  debugText: {
    fontWeight: 'bold',
  },
});
