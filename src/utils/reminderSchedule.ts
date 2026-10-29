import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../types/settings';
import { frequencies } from '../components/FrequencySelector';
import { defaultSettings, migrateFrequency, SETTINGS_STORAGE_KEY } from '../context/SettingsContext';
import i18n from '../localization';

// Reminders are pre-scheduled OS alarms (one DAILY trigger per time slot), so they fire on time
// without the app running. expo-notifications re-arms them after a reboot or an app update.

export const REMINDER_CHANNEL_ID = 'reminders';
const REMINDER_ID_PREFIX = 'tongueup-reminder-';
// What was last scheduled, to skip rescheduling when nothing changed
const SCHEDULE_SIGNATURE_STORAGE_KEY = '@app_tongue_reminder_schedule_sig';

const MINUTES_PER_DAY = 24 * 60;

export interface ReminderSlot {
  hour: number;
  minute: number;
}

const loadSettings = async (): Promise<Settings> => {
  const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : {};
  return { ...defaultSettings, ...parsed, frequency: migrateFrequency(parsed.frequency ?? defaultSettings.frequency) };
};

const intervalMinutes = (settings: Settings): number => {
  const label = Object.keys(frequencies)[settings.frequency] as keyof typeof frequencies;
  return (frequencies[label] ?? frequencies['Every 15 minutes']) / 60;
};

const hasQuietHours = (settings: Settings) =>
  settings.quietTimeEnabled && settings.quietTime.start !== settings.quietTime.end;

/**
 * Times of day a reminder fires. With quiet hours, slots start when they end (wake-up) and repeat
 * every interval until they begin again; otherwise they start from `reminderAnchorMinute`.
 * Every frequency divides 24h, so the same slots repeat each day.
 */
export const computeReminderSlots = (settings: Settings): ReminderSlot[] => {
  const interval = intervalMinutes(settings);
  const { start, end } = settings.quietTime;
  const quiet = hasQuietHours(settings);

  const anchor = quiet ? end * 60 : settings.reminderAnchorMinute;
  // Length of the window in which reminders may fire (wraps around midnight)
  const activeMinutes = quiet ? ((start - end + 24) % 24) * 60 : MINUTES_PER_DAY;

  const slots: ReminderSlot[] = [];
  for (let offset = 0; offset < activeMinutes; offset += interval) {
    const minuteOfDay = (anchor + offset) % MINUTES_PER_DAY;
    slots.push({ hour: Math.floor(minuteOfDay / 60), minute: minuteOfDay % 60 });
  }
  return slots;
};

/** Next time one of the slots fires, after `from` */
export const getNextReminderDate = (slots: ReminderSlot[], from = new Date()): Date | null => {
  let next: Date | null = null;
  for (const { hour, minute } of slots) {
    const date = new Date(from);
    date.setHours(hour, minute, 0, 0);
    if (date <= from) {
      date.setDate(date.getDate() + 1);
    }
    if (!next || date < next) {
      next = date;
    }
  }
  return next;
};

const slotIdentifier = ({ hour, minute }: ReminderSlot) =>
  `${REMINDER_ID_PREFIX}${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}`;

/** Creates the Android channel reminders are posted to (no-op if it already exists) */
export const ensureReminderChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: i18n.t('reminders.channelName'),
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 500, 250],
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
};

const canScheduleExactAlarms = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const { granted } = await Notifications.getExactAlarmPermissionsAsync();
  return granted;
};

const cancelReminders = async (scheduled: Notifications.NotificationRequest[]) => {
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(REMINDER_ID_PREFIX))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier))
  );
};

const applySchedule = async (givenSettings?: Settings) => {
  if (Platform.OS === 'web') {
    return;
  }
  const settings = givenSettings ?? (await loadSettings());
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  if (!settings.notificationsEnabled) {
    await cancelReminders(scheduled);
    await AsyncStorage.removeItem(SCHEDULE_SIGNATURE_STORAGE_KEY);
    return;
  }

  const slots = computeReminderSlots(settings);
  const delivery: Notifications.NotificationDelivery = settings.strictTiming ? 'alarmClock' : 'bestEffort';
  // Android picks exact or inexact alarms when they are set, so granting the permission needs a reschedule
  const exact = await canScheduleExactAlarms();
  const signature = JSON.stringify({ slots: slots.map(slotIdentifier), delivery, exact, lang: i18n.language });

  const expectedIds = new Set(slots.map(slotIdentifier));
  const scheduledIds = scheduled
    .map((request) => request.identifier)
    .filter((id) => id.startsWith(REMINDER_ID_PREFIX));
  const upToDate =
    (await AsyncStorage.getItem(SCHEDULE_SIGNATURE_STORAGE_KEY)) === signature &&
    scheduledIds.length === expectedIds.size &&
    scheduledIds.every((id) => expectedIds.has(id));
  if (upToDate) {
    return;
  }

  await ensureReminderChannel();
  await cancelReminders(scheduled);
  const content: Notifications.NotificationContentInput = {
    title: i18n.t('notification.title'),
    body: i18n.t('notification.body'),
    sound: 'default',
    vibrate: [0, 250, 500, 250],
    priority: Notifications.AndroidNotificationPriority.MAX,
  };
  for (const slot of slots) {
    await Notifications.scheduleNotificationAsync({
      identifier: slotIdentifier(slot),
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: slot.hour,
        minute: slot.minute,
        channelId: REMINDER_CHANNEL_ID,
        delivery,
      },
    });
  }
  await AsyncStorage.setItem(SCHEDULE_SIGNATURE_STORAGE_KEY, signature);
  console.log(`Scheduled ${slots.length} daily reminders (${delivery}, exact: ${exact})`);
};

let pending: Promise<void> = Promise.resolve();

/**
 * Makes the scheduled reminders match the settings (from storage when not given). Safe to call
 * any time, including outside React; calls run one after another so they never interleave.
 */
export const syncReminderSchedule = (settings?: Settings): Promise<void> => {
  pending = pending
    .then(() => applySchedule(settings))
    .catch((error) => console.error('Failed to sync reminders', error));
  return pending;
};
