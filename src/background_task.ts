import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from './types/settings';
import { frequencies } from './components/FrequencySelector';
import i18n from './localization';
const BACKGROUND_FETCH_TASK = 'tongue_app_background_fetch';
const SETTINGS_STORAGE_KEY = '@app_tongue_patrol_settings';

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
        const frequencyindex = parsedSettings.frequency || 0

        const prefs = {
            quietHours: parsedSettings.quietTime,
            intervalMinutes: frequencies[Object.keys(frequencies)[frequencyindex] as keyof typeof frequencies] / 60,
        }

        const now = new Date();
        const hour = now.getHours();

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

