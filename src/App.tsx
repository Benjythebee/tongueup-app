import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ReminderScreen';
import { RootTabParamList } from './types/navigation';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Insets, StyleSheet, View } from 'react-native';
import { SettingsProvider } from './context/SettingsContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import { SavedDataProvider } from './context/TimeSeriesData';
import SettingsScreen from './screens/SettingsScreen';
import Icon from '@react-native-vector-icons/lucide';
import './localization';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<RootTabParamList>();

const App: React.FC = () => {
  usePushNotifications();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <SavedDataProvider>
                <Navigation />
                <StatusBar style="auto" />
            </SavedDataProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// Simple icon components (you can replace with your preferred icon library)
const HomeIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Icon name="text" size={size} color={color} />
);

const ReminderIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Icon name="clock" size={size} color={color} />
);

const SettingsIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Icon name="cog" size={size} color={color} />
);
export default App;

const Navigation = ()=>{
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const {t} = useTranslation();
  const styles = useMemo(() => createStyles(colors,insets), [colors,insets]);

  return (<NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: '#007AFF',
                  tabBarInactiveTintColor: '#8E8E93',
                  headerShown: false,
                  tabBarStyle: styles.tabBar,
                }}
              >
                <Tab.Screen
                  name="Notes"
                  component={HomeScreen}
                  options={{
                    tabBarLabel: t("header.Notes"),
                    tabBarIcon: ({ color, size }) => (
                      <HomeIcon color={color} size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Reminder"
                  component={ExploreScreen}
                  options={{
                    tabBarLabel: t("header.Reminders"),
                    tabBarIcon: ({ color, size }) => (
                      <ReminderIcon color={color} size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    tabBarLabel: t('header.Settings'),
                    tabBarIcon: ({ color, size }) => (
                      <SettingsIcon color={color} size={size} />
                    ),
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>)
}

const createStyles = (colors: any,insets:Insets) =>StyleSheet.create({
  tabBar:{
    paddingBottom:insets.bottom,
    backgroundColor: colors.background,
  },
  tab:{
    backgroundColor: colors.background,
  },
  tabText:{
    color: colors.text,
  }
})