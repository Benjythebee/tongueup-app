import { Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncReminderSchedule } from './utils/reminderSchedule';

// Versions up to 1.0.x sent reminders from this WorkManager task, which Android runs late or not at
// all. Reminders are now scheduled alarms (utils/reminderSchedule.ts); the task only stays defined
// so installs that still have it registered can run it once more, and is unregistered on launch.
// TODO: remove this file and expo-background-task / expo-task-manager in a later release.
export const BACKGROUND_FETCH_TASK = 'tongue_app_background_fetch';
const LEGACY_LAST_REMINDER_STORAGE_KEY = '@app_tongue_last_reminder';

export const setupTaskManager = () => {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        await syncReminderSchedule();
        return BackgroundTask.BackgroundTaskResult.Success;
    });
}

export const retireLegacyBackgroundTask = async () => {
    if (Platform.OS === 'web') {
        return;
    }
    try {
        if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK)) {
            await BackgroundTask.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
        }
        await AsyncStorage.removeItem(LEGACY_LAST_REMINDER_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to unregister the legacy background task', error);
    }
}
