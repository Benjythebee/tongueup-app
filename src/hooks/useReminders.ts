import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { ensureReminderChannel, syncReminderSchedule } from "../utils/reminderSchedule";
import { retireLegacyBackgroundTask } from "../background_task";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowBanner: false,
    shouldShowList: true,
    shouldSetBadge: false,
  }),
});

const onForeground = (callback: () => void) => {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      callback();
    }
  });
  return () => subscription.remove();
};

/** One-time native setup: reminder channel and removal of the old background task */
export const useNotificationSetup = () => {
  useEffect(() => {
    // Notifications aren't supported on web (only used for the design preview)
    if (Platform.OS === "web") {
      return;
    }
    ensureReminderChannel().catch((error) => console.error("Failed to create the reminder channel", error));
    retireLegacyBackgroundTask();
  }, []);
};

/** Keeps scheduled reminders in line with settings, language and permissions. Must be inside SettingsProvider. */
export const useReminderSync = () => {
  const { settings, loading } = useSettings();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Until stored settings load, `settings` holds the defaults (reminders off) and would cancel everything
    if (loading || Platform.OS === "web") {
      return;
    }
    syncReminderSchedule(settings);
  }, [loading, settings, i18n.language]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    return onForeground(() => {
      // Picks up a newly granted exact-alarm permission, and clears reminders the user has seen by opening the app
      syncReminderSchedule();
      Notifications.dismissAllNotificationsAsync();
    });
  }, []);
};

export interface ReminderPermissions {
  notifications: boolean;
  /** Whether the system shows the notification permission dialog again; otherwise only app settings can grant it */
  canAskNotifications: boolean;
  exactAlarms: boolean;
}

/** Notification and exact-alarm permission state, refreshed when the app comes back to the foreground */
export const useReminderPermissions = () => {
  const [permissions, setPermissions] = useState<ReminderPermissions | null>(null);

  const refresh = useCallback(async () => {
    if (Platform.OS === "web") {
      setPermissions({ notifications: true, canAskNotifications: true, exactAlarms: true });
      return;
    }
    const [notifications, exactAlarms] = await Promise.all([
      Notifications.getPermissionsAsync(),
      Notifications.getExactAlarmPermissionsAsync(),
    ]);
    setPermissions({
      notifications: notifications.granted,
      canAskNotifications: notifications.canAskAgain,
      exactAlarms: exactAlarms.granted,
    });
  }, []);

  useEffect(() => {
    refresh();
    return onForeground(refresh);
  }, [refresh]);

  return { permissions, refresh };
};
