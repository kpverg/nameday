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
import { AppProvider } from './src/AppContext';
import MainScreen from './src/screens/MainScreen';
import SplashLoading from './src/SplashLoading';
import { useState, useEffect } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    // Fallback inline splash in case import resolution misbehaves
    const InlineSplash = ({ onComplete }: { onComplete: () => void }) => {
      useEffect(() => {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
      }, [onComplete]);
      return (
        <View style={stylesSplash.container}>
          <Text style={stylesSplash.title}>Εορτολόγιο</Text>
          <ActivityIndicator
            size="large"
            color="#1E6AC7"
            style={stylesSplash.spinner}
          />
          <Text style={stylesSplash.subtitle}>Φόρτωση...</Text>
        </View>
      );
    };

    // Prefer external component; fallback to inline if undefined
    const Comp: any = SplashLoading ?? InlineSplash;
    return <Comp onComplete={() => setIsLoading(false)} />;
  }

  return (
    <AppProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MainScreen />
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
