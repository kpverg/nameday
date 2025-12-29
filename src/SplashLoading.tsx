import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface SplashLoadingProps {
  onComplete: () => void;
}

export default function SplashLoading({ onComplete }: SplashLoadingProps) {
  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Εορτολόγιο</Text>
      <ActivityIndicator size="large" color="#1E6AC7" style={styles.spinner} />
      <Text style={styles.subtitle}>Φόρτωση...</Text>
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
