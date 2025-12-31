import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../AppContext';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  darkMode?: boolean;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  darkMode,
}: SettingItemProps) => {
  const isToggle = onToggle !== undefined;

  return (
    <TouchableOpacity
      style={[styles.settingItem, darkMode && styles.settingItemDark]}
      onPress={onPress}
      disabled={isToggle}
      activeOpacity={isToggle ? 1 : 0.6}
    >
      <Ionicons
        name={icon}
        size={24}
        color={darkMode ? '#60A5FA' : '#1E6AC7'}
      />
      <View style={styles.settingContent}>
        <Text
          style={[styles.settingTitle, darkMode && styles.settingTitleDark]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.settingSubtitle,
              darkMode && styles.settingSubtitleDark,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {isToggle && (
        <Switch
          value={value || false}
          onValueChange={onToggle}
          trackColor={{ false: '#4B5563', true: '#86EFAC' }}
          thumbColor={value ? '#60A5FA' : '#6B7280'}
        />
      )}
      {!isToggle && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={darkMode ? '#6B7280' : '#9CA3AF'}
        />
      )}
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);
  const {
    globalDaysEnabled,
    setGlobalDaysEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    backgroundTone,
    setBackgroundTone,
    textTone,
    setTextTone,
  } = useAppContext();

  const backgroundOptions = [
    { key: 'neutral', label: 'Ουδέτερο φόντο' },
    { key: 'light', label: 'Απαλό / ανοιχτό φόντο' },
  ] as const;

  const textOptions = [
    { key: 'normal', label: 'Κανονικό κείμενο' },
    { key: 'dark', label: 'Σκούρα, έντονη γραμματοσειρά' },
  ] as const;

  const renderOptionSheet = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: { key: string; label: string }[],
    selected: string,
    onSelect: (key: string) => void,
  ) => (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <View
          style={[styles.sheetCard, darkModeEnabled && styles.sheetCardDark]}
        >
          <Text
            style={[
              styles.sheetTitle,
              darkModeEnabled && styles.sheetTitleDark,
            ]}
          >
            {title}
          </Text>
          {options.map(opt => {
            const isSelected = opt.key === selected;
            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.sheetOption,
                  isSelected && styles.sheetOptionSelected,
                  darkModeEnabled && styles.sheetOptionDark,
                ]}
                onPress={() => {
                  onSelect(opt.key);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.sheetOptionText,
                    darkModeEnabled && styles.sheetOptionTextDark,
                    isSelected && styles.sheetOptionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={darkModeEnabled ? '#BFDBFE' : '#1E6AC7'}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <ScrollView
      style={[styles.container, darkModeEnabled && styles.containerDark]}
    >
      <Text style={[styles.title, darkModeEnabled && styles.titleDark]}>
        Ρυθμίσεις
      </Text>
      <Text style={[styles.subtitle, darkModeEnabled && styles.subtitleDark]}>
        Προτιμήσεις εφαρμογής
      </Text>

      <View style={[styles.section, darkModeEnabled && styles.sectionDark]}>
        <Text
          style={[
            styles.sectionTitle,
            darkModeEnabled && styles.sectionTitleDark,
          ]}
        >
          Ειδοποιήσεις
        </Text>
        <SettingItem
          icon="notifications"
          title="Ενεργοποίηση ειδοποιήσεων"
          value={notifications}
          onToggle={setNotifications}
          darkMode={darkModeEnabled}
        />
        <SettingItem
          icon="alarm"
          title="Ειδοποιήσεις Υπενθυμίσεων"
          subtitle="Πλοποίηση αν έχετε την ενεργοποίηση"
          value={reminders}
          onToggle={setReminders}
          onPress={() => {}}
          darkMode={darkModeEnabled}
        />
      </View>

      <View style={[styles.section, darkModeEnabled && styles.sectionDark]}>
        <Text
          style={[
            styles.sectionTitle,
            darkModeEnabled && styles.sectionTitleDark,
          ]}
        >
          Εμφάνιση
        </Text>
        <SettingItem
          icon="moon"
          title="Σκοτεινή λειτουργία"
          value={darkModeEnabled}
          onToggle={setDarkModeEnabled}
          darkMode={darkModeEnabled}
        />
        <SettingItem
          icon="color-palette"
          title="Αποχρώσεις φόντου"
          subtitle={
            backgroundTone === 'light'
              ? 'Απαλό / ανοιχτό φόντο'
              : 'Ουδέτερο φόντο'
          }
          onPress={() => setShowBackgroundPicker(true)}
          darkMode={darkModeEnabled}
        />
        <SettingItem
          icon="contrast"
          title="Αποχρώσεις κειμένου"
          subtitle={
            textTone === 'dark'
              ? 'Σκούρα, έντονη γραμματοσειρά'
              : 'Κανονικό κείμενο'
          }
          onPress={() => setShowTextPicker(true)}
          darkMode={darkModeEnabled}
        />
        <SettingItem
          icon="globe"
          title="Παγκόσμιες ημέρες"
          value={globalDaysEnabled}
          onToggle={setGlobalDaysEnabled}
          darkMode={darkModeEnabled}
        />
        <SettingItem
          icon="language"
          title="Γλώσσα"
          subtitle="Ελληνικά"
          onPress={() => console.log('Change language')}
          darkMode={darkModeEnabled}
        />
      </View>

      <View style={[styles.section, darkModeEnabled && styles.sectionDark]}>
        <Text
          style={[
            styles.sectionTitle,
            darkModeEnabled && styles.sectionTitleDark,
          ]}
        >
          Σχετικά
        </Text>
        <SettingItem
          icon="information-circle"
          title="Σχετικά"
          subtitle="Έκδοση 1.0.0"
          onPress={() => console.log('About')}
          darkMode={darkModeEnabled}
        />
        <SettingItem
          icon="help-circle"
          title="Βοήθεια"
          onPress={() => console.log('Help')}
          darkMode={darkModeEnabled}
        />
      </View>

      <View style={[styles.footer, darkModeEnabled && styles.footerDark]}>
        <Text
          style={[styles.footerText, darkModeEnabled && styles.footerTextDark]}
        >
          Εορτολόγιο v1.0.0
        </Text>
        <Text
          style={[styles.footerText, darkModeEnabled && styles.footerTextDark]}
        >
          © 2025 Όλα τα δικαιώματα διατηρούνται
        </Text>
      </View>

      {renderOptionSheet(
        showBackgroundPicker,
        () => setShowBackgroundPicker(false),
        'Αποχρώσεις φόντου',
        backgroundOptions,
        backgroundTone,
        key => setBackgroundTone(key as any),
      )}

      {renderOptionSheet(
        showTextPicker,
        () => setShowTextPicker(false),
        'Αποχρώσεις κειμένου',
        textOptions,
        textTone,
        key => setTextTone(key as any),
      )}
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
  containerDark: {
    backgroundColor: '#1F2937',
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
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionDark: {
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionTitleDark: {
    color: '#9CA3AF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemDark: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
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
  settingTitleDark: {
    color: '#F3F4F6',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  settingSubtitleDark: {
    color: '#9CA3AF',
  },
  footer: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerDark: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: -16,
    marginRight: -16,
    marginLeft: -16,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footerTextDark: {
    color: '#6B7280',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheetCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    elevation: 6,
  },
  sheetCardDark: {
    backgroundColor: '#111827',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sheetTitleDark: {
    color: '#E5E7EB',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  sheetOptionDark: {
    backgroundColor: '#1F2937',
  },
  sheetOptionSelected: {
    backgroundColor: '#E0ECFF',
  },
  sheetOptionText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },
  sheetOptionTextDark: {
    color: '#E5E7EB',
  },
  sheetOptionTextSelected: {
    fontWeight: '700',
  },
});
