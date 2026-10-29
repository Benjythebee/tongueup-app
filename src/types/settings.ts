export interface QuietTime {
  start:number; // hours 0-23
  end:number; // hours 0-23
}


export interface Settings {
  frequency: number;
  notificationsEnabled: boolean;
  quietTime:QuietTime
  quietTimeEnabled: boolean;
  // Use AlarmManager.setAlarmClock(): never deferred by battery saving, but shows an alarm icon
  strictTiming: boolean;
  // Minute of the day reminder slots start from when there are no quiet hours (set when reminders are enabled)
  reminderAnchorMinute: number;
  theme: 'light' | 'dark';
}
