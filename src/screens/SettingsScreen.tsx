import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
}: SettingItemProps) => {
  const isToggle = onToggle !== undefined;

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={isToggle}
      activeOpacity={isToggle ? 1 : 0.6}
    >
      <Ionicons name={icon} size={24} color="#1E6AC7" />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {isToggle && (
        <Switch
          value={value || false}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
          thumbColor={value ? '#1E6AC7' : '#F3F4F6'}
        />
      )}
      {!isToggle && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [reminders, setReminders] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ρυθμίσεις</Text>
      <Text style={styles.subtitle}>Προτιμήσεις εφαρμογής</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ειδοποιήσεις</Text>
        <SettingItem
          icon="notifications"
          title="Ενεργοποίηση ειδοποιήσεων"
          value={notifications}
          onToggle={setNotifications}
        />
        <SettingItem
          icon="alarm"
          title="Ειδοποιήσεις Υπενθυμίσεων"
          subtitle="Πλοποίηση αν έχετε την ενεργοποίηση"
          value={reminders}
          onToggle={setReminders}
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Εμφάνιση</Text>
        <SettingItem
          icon="moon"
          title="Σκοτεινή λειτουργία"
          value={darkMode}
          onToggle={setDarkMode}
        />
        <SettingItem
          icon="language"
          title="Γλώσσα"
          subtitle="Ελληνικά"
          onPress={() => console.log('Change language')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Σχετικά</Text>
        <SettingItem
          icon="information-circle"
          title="Σχετικά"
          subtitle="Έκδοση 1.0.0"
          onPress={() => console.log('About')}
        />
        <SettingItem
          icon="help-circle"
          title="Βοήθεια"
          onPress={() => console.log('Help')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Εορτολόγιο v1.0.0</Text>
        <Text style={styles.footerText}>
          © 2025 Όλα τα δικαιώματα διατηρούνται
        </Text>
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
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
