import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Settings } from "../types/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Default settings
const defaultSettings: Settings = {
  frequency: 1, // Default frequency value
  notificationsEnabled: false, // Default notification setting
  quietTime: {
    start: 22, // Default quiet time start hour (10 PM)
    end: 8, // Default quiet time end hour (8 AM)
  },
  theme:'light', // Default theme
};

const oldFrequencyToNew = {
 9:7,
 8:6 
}

// Storage key
const SETTINGS_STORAGE_KEY = '@app_tongue_patrol_settings';

// Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider Props
interface SettingsProviderProps {
  children: ReactNode;
}

// Provider Component
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        parsedSettings.frequency = (oldFrequencyToNew as any)[parsedSettings.frequency] || parsedSettings.frequency;
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      throw err;
    }
  };

  const updateSetting = async <K extends keyof Settings>(
    key: K, 
    value: Settings[K]
  ): Promise<void> => {
    try {
      setError(null);
      
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveSettings(newSettings);
    } catch (err) {
      // Revert the state change if saving failed
      setSettings(settings);
      throw err;
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSetting,
    loading,
    error,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom Hook
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};
