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
import { getTodayFests, Fest } from './src/services/apiservices/todayfest';
import { getFestsByMonth } from './src/services/apiservices/totalMonthFests';
import supabase from './src/utils/supabase';

function AppContent() {
  const { isLoading, backgroundColor, textColor } = useAppContext();
  useNotifications(); // Initialize notifications
  const isDarkMode = useColorScheme() === 'dark';
  const [showApp, setShowApp] = useState(!isLoading);
  const [fests, setFests] = useState<Fest[]>([]);
  const [monthFests, setMonthFests] = useState<Fest[]>([]);

  useEffect(() => {
    async function fetchFests() {
      try {
        console.log('Fetching today fests...');
        const data = await getTodayFests();
        console.log('Fetched data (today):', data);
        if (data && data.length > 0) {
          setFests(data);
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
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setShowApp(true);
    }
  }, [isLoading]);

  if (!showApp) {
    // Fallback inline splash in case import resolution misbehaves
    const InlineSplash = ({ onComplete }: { onComplete: () => void }) => {
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

    // Prefer external component; fallback to inline if undefined
    const Comp: any = SplashLoading ?? InlineSplash;
    return <Comp onComplete={() => setShowApp(true)} />;
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MainScreen supabaseFests={fests} supabaseMonthFests={monthFests} />
      {/* Temporary Debug View for Supabase Data */}
      {fests.length > 0 && (
        <View style={{ position: 'absolute', bottom: 50, left: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Supa Data: {fests[0].names}</Text>
        </View>
      )}
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
});
