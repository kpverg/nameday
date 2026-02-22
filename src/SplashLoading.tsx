import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface SplashLoadingProps {
  onComplete: () => void;
  primaryColor?: string;
  textColor?: string;
}

export default function SplashLoading({ onComplete, primaryColor = '#1E6AC7', textColor = '#374151' }: SplashLoadingProps) {
  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: primaryColor }]}>Εορτολόγιο</Text>
      <ActivityIndicator size="large" color={primaryColor} style={styles.spinner} />
      <Text style={[styles.subtitle, { color: textColor }]}>Φόρτωση...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});
