import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { QuietTime } from '../types/settings';

const isTimeInQuietPeriod = (date: Date, _quietTimes: QuietTime): boolean => {
  const quietTimes = Array.isArray(_quietTimes) ? _quietTimes : [_quietTimes] as QuietTime[]
  const hour = date.getHours();
  const minute = date.getMinutes();
  const day = date.getDay();
  const timeInMinutes = hour * 60 + minute;

  return quietTimes.some((quietTime:QuietTime) => {

    const startMinutes = quietTime.start * 60 
    const endMinutes = quietTime.end * 60 

    // Handle overnight quiet times (e.g., 10 PM to 8 AM)
    if (startMinutes > endMinutes) {
      return timeInMinutes >= startMinutes || timeInMinutes <= endMinutes;
    }
    
    // Regular quiet time (same day)
    return timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
  });
};


export const scheduleRecurringNotificationsWithQuietTimes = async (
  config: {
    identifier: string;
    quietTimes: QuietTime
    content: Notifications.NotificationContentInput;
    intervalMinutes: number;
    durationHours?: number; // How long to keep scheduling (default 37 hours)
  }
): Promise<void> => {
  const { identifier, content, intervalMinutes,quietTimes, durationHours = 37 } = config;

  // Clear any existing notifications with this identifier
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
  let nextTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
  let count = 0;

  while (nextTime < endTime && count < 150) { // Safety limit
    // Skip if this time is in a quiet period
    if (!isTimeInQuietPeriod(nextTime, quietTimes)) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${identifier}-${count}`,
        content: {
          ...content,
          body: content.body, // Keep original body
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextTime,
        },
      });
      count++;
    }

    // Move to next interval
    nextTime = new Date(nextTime.getTime() + intervalMinutes * 60 * 1000);
  }

  console.log(`Scheduled ${count} notifications over ${durationHours} hours`);
};