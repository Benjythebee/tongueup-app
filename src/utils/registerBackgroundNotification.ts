import * as BackgroundTask from 'expo-background-task';

const BACKGROUND_FETCH_TASK = 'tongue_app_background_fetch';


// 2. Register the task at some point in your app by providing the same name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundTaskAsync() {
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