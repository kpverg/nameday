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
import { AppProvider, useAppContext } from './src/AppContext';
import { ContactsProvider } from './src/ContactsContext';
import MainScreen from './src/screens/MainScreen';
import SplashLoading from './src/SplashLoading';
import { useState, useEffect } from 'react';
import { useNotifications } from './src/useNotifications';
import { getTodayFests } from './src/services/apiservices/todayfest';
import { getFestsByMonth } from './src/services/apiservices/totalMonthFests';
import { getTodayWorldDays, getWorldDaysByMonth, WorldDay } from './src/services/apiservices/worldday';
import type { Fest } from './src/types/fest';
import supabase from './src/utils/supabase';

// Fallback inline splash in case import resolution misbehaves
const InlineSplash = ({ onComplete, backgroundColor, textColor }: { onComplete: () => void, backgroundColor: string, textColor: string }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <View style={[stylesSplash.container, { backgroundColor }]}>
      <Text style={[stylesSplash.title, { color: textColor }]}>
        Εορτολόγιο
      </Text>
      <ActivityIndicator
        size="large"
        color={textColor}
        style={stylesSplash.spinner}
      />
      <Text style={[stylesSplash.subtitle, { color: textColor }]}>
        Φόρτωση...
      </Text>
    </View>
  );
};

function AppContent() {
  const { isLoading, backgroundColor, textColor, globalDaysEnabled } = useAppContext();
  const isDarkMode = useColorScheme() === 'dark';
  const [showApp, setShowApp] = useState(!isLoading);
  const [fests, setFests] = useState<Fest[]>([]);
  const [monthFests, setMonthFests] = useState<Fest[]>([]);
  const [worldDays, setWorldDays] = useState<WorldDay[]>([]);
  const [monthWorldDays, setMonthWorldDays] = useState<WorldDay[]>([]);

  useNotifications(fests, worldDays); // Initialize notifications with remote data

  useEffect(() => {
    async function fetchFests() {
      try {
        console.log('Fetching today fests...');
        const data = await getTodayFests();
        console.log('Fetched data (today):', data);
        if (data && data.length > 0) {
          setFests(data);
        }

        // Fetch today world days if enabled
        if (globalDaysEnabled) {
          console.log('Fetching today world days...');
          const wd = await getTodayWorldDays();
          console.log('Fetched world days (today):', wd);
          setWorldDays(wd);
        }

        // Fetch total fests for the current month
        const greekMonths = [
          'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
          'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
        ];
        const currentMonth = greekMonths[new Date().getMonth()];
        console.log(`Fetching fests for total month: ${currentMonth}...`);
        
        // Debug: Fetch first 3 entries to see column values
        const { data: debugData } = await supabase.from('fests').select('*').limit(3);
        console.log('DEBUG: First 3 rows in Supabase:', debugData);

        const monthData = await getFestsByMonth(currentMonth);
        console.log(`Fetched data (month: ${currentMonth}):`, monthData);
        setMonthFests(monthData);

        // Fetch month world days if enabled
        if (globalDaysEnabled) {
          console.log(`Fetching world days for month: ${currentMonth}...`);
          const monthWD = await getWorldDaysByMonth(currentMonth);
          console.log(`Fetched world days (month: ${currentMonth}):`, monthWD);
          setMonthWorldDays(monthWD);
        }

        if (monthData.length === 0) {
          console.log('WARNING: No data for current month. Checking possible month values in DB...');
          const { data: possibleMonths } = await supabase.from('fests').select('month').limit(10);
          console.log('Possible month values in DB:', possibleMonths);
        }

      } catch (err) {
        console.error('Supabase error:', err);
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
    // Prefer external component; fallback to inline if undefined
    if (SplashLoading) {
      const Comp: any = SplashLoading;
      return <Comp onComplete={() => setShowApp(true)} />;
    }
    return <InlineSplash onComplete={() => setShowApp(true)} backgroundColor={backgroundColor} textColor={textColor} />;
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MainScreen 
        supabaseFests={fests} 
        supabaseMonthFests={monthFests} 
        supabaseWorldDays={worldDays}
        supabaseMonthWorldDays={monthWorldDays}
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <ContactsProvider>
        <AppContent />
      </ContactsProvider>
    </AppProvider>
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
    color: '#1E6AC7',
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
