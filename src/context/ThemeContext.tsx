import React, { createContext, useContext, ReactNode } from 'react';
import { Theme, ThemeColors } from '../types/common';
import { useSettings } from './SettingsContext';
import { darkColors, lightColors } from '../theme/tokens';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, updateSetting } = useSettings();
  // Derived from settings so the saved theme applies once settings finish loading
  const theme = settings.theme;

  const toggleTheme = () => {
    updateSetting('theme', theme === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    colors: theme === 'dark' ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
