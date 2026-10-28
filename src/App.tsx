import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/HomeScreen';
import ReminderScreen from './screens/ReminderScreen';
import { RootTabParamList } from './types/navigation';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { StyleSheet } from 'react-native';
import { SettingsProvider } from './context/SettingsContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import { SavedDataProvider } from './context/TimeSeriesData';
import SettingsScreen from './screens/SettingsScreen';
import Icon from '@react-native-vector-icons/lucide';
import './localization';
import { useTranslation } from 'react-i18next';
import { setupTaskManager } from './background_task';
import { IconName } from './types/common';

const Tab = createBottomTabNavigator<RootTabParamList>();

setupTaskManager();

const App: React.FC = () => {
  usePushNotifications();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <SavedDataProvider>
                <Navigation />
            </SavedDataProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const tabIcon = (name: IconName) => ({ color, size }: { color: string; size: number }) => (
  <Icon name={name} size={size - 2} color={color} />
);

export default App;

const Navigation = ()=>{
  const {colors, isDark} = useTheme();
  const {t} = useTranslation();

  // Keeps navigator backgrounds in sync with the app theme (no white flash between tabs in dark mode)
  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colors, isDark]);

  return (<NavigationContainer theme={navigationTheme}>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: colors.primary,
                  tabBarInactiveTintColor: colors.textMuted,
                  headerShown: false,
                  tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    elevation: 0,
                  },
                  tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                  },
                }}
              >
                <Tab.Screen
                  name="Notes"
                  component={HomeScreen}
                  options={{
                    tabBarLabel: t("header.Notes"),
                    tabBarIcon: tabIcon("notebook-pen"),
                  }}
                />
                <Tab.Screen
                  name="Reminder"
                  component={ReminderScreen}
                  options={{
                    tabBarLabel: t("header.Reminders"),
                    tabBarIcon: tabIcon("bell"),
                  }}
                />
                <Tab.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    tabBarLabel: t('header.Settings'),
                    tabBarIcon: tabIcon("settings"),
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>)
}
