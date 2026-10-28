import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from './types/settings';
import { frequencies } from './components/FrequencySelector';
import { migrateFrequency, SETTINGS_STORAGE_KEY } from './context/SettingsContext';
import i18n from './localization';
export const BACKGROUND_FETCH_TASK = 'tongue_app_background_fetch';
// Timestamp (ms) of the last reminder sent, used to honor the chosen frequency
export const LAST_REMINDER_STORAGE_KEY = '@app_tongue_last_reminder';

// The OS runs the task roughly every 15 minutes at best and not on the dot,
// so allow a reminder slightly early rather than skipping a whole extra run
const FREQUENCY_SLACK_MS = 5 * 60 * 1000;

const identifier = "tongueup-tongue-reminder";

const _notificationContent: Notifications.NotificationContentInput = {
            title: "Your tongue!",
            body: "Have you been keeping your tongue on the roof of your mouth?",
            vibrate: [0, 250, 500, 250],
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.MAX,
        }

export const setupTaskManager = () => {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        console.log('Background fetch executed');
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (!storedSettings) {
            return BackgroundTask.BackgroundTaskResult.Failed;
        }
        const parsedSettings = JSON.parse(storedSettings) as Settings;
        const frequencyindex = migrateFrequency(parsedSettings.frequency || 0)
        const frequencySeconds = frequencies[Object.keys(frequencies)[frequencyindex] as keyof typeof frequencies]
            ?? frequencies["Every 15 minutes"];

        const prefs = {
            quietHours: parsedSettings.quietTime,
            intervalMinutes: frequencySeconds / 60,
        }

        const now = new Date();
        const hour = now.getHours();

        // Check chosen frequency
        const lastReminder = Number(await AsyncStorage.getItem(LAST_REMINDER_STORAGE_KEY)) || 0;
        if (now.getTime() - lastReminder < prefs.intervalMinutes * 60 * 1000 - FREQUENCY_SLACK_MS) {
            console.log('Too early for the next reminder - no notification');
            return BackgroundTask.BackgroundTaskResult.Success;
        }

        // Check quiet hours
        const { start, end } = prefs.quietHours;
        const isQuietTime = start < end
        ? hour >= start && hour < end
        : hour >= start || hour < end; // wraps around midnight

        if (isQuietTime) {
            console.log('Quiet hours - no notification');
            return BackgroundTask.BackgroundTaskResult.Failed;
        }

        const notificationContent = {
            ..._notificationContent,
            title: i18n.t("notification.title"),
            body: i18n.t("notification.body"),
        }
        try{
            console.log('Scheduling notification');
            await Notifications.scheduleNotificationAsync({
                content: notificationContent,
                trigger: null, // immediate
                identifier,
            })
            await AsyncStorage.setItem(LAST_REMINDER_STORAGE_KEY, String(now.getTime()));
        }catch{
            return BackgroundTask.BackgroundTaskResult.Failed;
        }

        return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
        console.error(error);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
    });
}

