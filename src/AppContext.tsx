import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BackgroundTone =
  | 'white'
  | 'cream'
  | 'lightBlue'
  | 'mint'
  | 'neutral'
  | 'light';
type TextTone = 'black' | 'navy' | 'darkGreen' | 'burgundy' | 'dark' | 'normal';

interface AppContextType {
  globalDaysEnabled: boolean;
  setGlobalDaysEnabled: (value: boolean) => void;
  darkModeEnabled: boolean;
  setDarkModeEnabled: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  backgroundTone: BackgroundTone;
  setBackgroundTone: (value: BackgroundTone) => void;
  textTone: TextTone;
  setTextTone: (value: TextTone) => void;
  backgroundColor: string;
  textColor: string;
  effectiveTextColor: string;
  isLoading: boolean;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  GLOBAL_DAYS: 'app_global_days_enabled',
  DARK_MODE: 'app_dark_mode_enabled',
  NOTIFICATIONS: 'app_notifications_enabled',
  BACKGROUND_TONE: 'app_background_tone',
  TEXT_TONE: 'app_text_tone',
  SELECTED_YEAR: 'app_selected_year',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [globalDaysEnabled, setGlobalDaysEnabledState] = useState(false);
  const [darkModeEnabled, setDarkModeEnabledState] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [backgroundTone, setBackgroundToneState] =
    useState<BackgroundTone>('neutral');
  const [textTone, setTextToneState] = useState<TextTone>('normal');

  // Mapping για τα χρώματα
  const backgroundColorMap: Record<BackgroundTone, string> = {
    white: '#FFFFFF',
    cream: '#FFF8E1',
    lightBlue: '#E3F2FD',
    mint: '#E6FFF7',
    neutral: '#F3F4F6',
    light: '#F9FAFB',
  };
  const textColorMap: Record<TextTone, string> = {
    black: '#111827',
    navy: '#1E293B',
    darkGreen: '#14532D',
    burgundy: '#581C1C',
    dark: '#22223B',
    normal: '#374151',
  };
  const backgroundColor = backgroundColorMap[backgroundTone] || '#F3F4F6';
  const textColor = textColorMap[textTone] || '#374151';
  // In dark mode, always use default light text colors; in light mode, use user selected colors
  const effectiveTextColor = darkModeEnabled ? '#E5E7EB' : textColor;
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYearState] = useState<number>(
    new Date().getFullYear(),
  );

  // Load settings from AsyncStorage on app startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [
          globalDays,
          darkMode,
          notifications,
          storedBackground,
          storedTextTone,
          storedYear,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_DAYS),
          AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_TONE),
          AsyncStorage.getItem(STORAGE_KEYS.TEXT_TONE),
          AsyncStorage.getItem(STORAGE_KEYS.SELECTED_YEAR),
        ]);

        if (globalDays !== null) {
          setGlobalDaysEnabledState(globalDays === 'true');
        }
        if (darkMode !== null) {
          setDarkModeEnabledState(darkMode === 'true');
        }
        if (notifications !== null) {
          setNotificationsEnabledState(notifications === 'true');
        }
        if (storedYear !== null) {
          const y = parseInt(storedYear, 10);
          if (!Number.isNaN(y)) setSelectedYearState(y);
        }
        if (storedBackground !== null) {
          setBackgroundToneState(
            storedBackground === 'light' ? 'light' : 'neutral',
          );
        }
        if (storedTextTone !== null) {
          setTextToneState(storedTextTone === 'dark' ? 'dark' : 'normal');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save global days setting
  const setGlobalDaysEnabled = async (value: boolean) => {
    try {
      setGlobalDaysEnabledState(value);
      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_DAYS, String(value));
    } catch (error) {
      console.error('Error saving global days setting:', error);
    }
  };

  // Save dark mode setting
  const setDarkModeEnabled = async (value: boolean) => {
    try {
      setDarkModeEnabledState(value);
      await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(value));
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  // Save notifications setting
  const setNotificationsEnabled = async (value: boolean) => {
    try {
      setNotificationsEnabledState(value);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(value));
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  };

  const setBackgroundTone = async (value: BackgroundTone) => {
    try {
      setBackgroundToneState(value);
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_TONE, value);
    } catch (error) {
      console.error('Error saving background tone setting:', error);
    }
  };

  const setTextTone = async (value: TextTone) => {
    try {
      setTextToneState(value);
      await AsyncStorage.setItem(STORAGE_KEYS.TEXT_TONE, value);
    } catch (error) {
      console.error('Error saving text tone setting:', error);
    }
  };

  // Save selected year setting
  const setSelectedYear = async (year: number) => {
    try {
      setSelectedYearState(year);
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, String(year));
    } catch (error) {
      console.error('Error saving selected year:', error);
    }
  };

  const value: AppContextType = {
    globalDaysEnabled,
    setGlobalDaysEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    backgroundTone,
    setBackgroundTone,
    textTone,
    setTextTone,
    backgroundColor,
    textColor,
    effectiveTextColor,
    isLoading,
    selectedYear,
    setSelectedYear,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
