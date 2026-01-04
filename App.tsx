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

function AppContent() {
  const { isLoading, backgroundColor, textColor } = useAppContext();
  const isDarkMode = useColorScheme() === 'dark';
  const [showApp, setShowApp] = useState(!isLoading);

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
      <MainScreen />
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
