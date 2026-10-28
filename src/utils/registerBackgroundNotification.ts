import * as BackgroundTask from 'expo-background-task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKGROUND_FETCH_TASK, LAST_REMINDER_STORAGE_KEY } from '../background_task';


// 2. Register the task at some point in your app by providing the same name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundTaskAsync() {
  // Start counting the chosen frequency from now, so the first reminder comes one interval later
  await AsyncStorage.setItem(LAST_REMINDER_STORAGE_KEY, String(Date.now()));
  return BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK,{
    minimumInterval: 15 * 60, // 15 minutes
  });
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundTaskAsync() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export { registerBackgroundTaskAsync, unregisterBackgroundTaskAsync };
