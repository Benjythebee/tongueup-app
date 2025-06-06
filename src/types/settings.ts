

export interface QuietTime {
  start:number; // hours 1-24
  end:number; // hours 1-24
}


export interface Settings {
  frequency: number;
  notificationsEnabled: boolean;
  quietTime:QuietTime
  theme: 'light' | 'dark';
}