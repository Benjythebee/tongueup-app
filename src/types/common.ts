import type { ComponentProps } from 'react';
import type Icon from '@react-native-vector-icons/lucide';

export interface Card {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  timestamp: Date;
  isBookmarked: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  isLoading: boolean;
  user: User | null;
  cards: Card[];
  bookmarkedCards: Card[];
}

export type Theme = 'light' | 'dark';

export type IconName = ComponentProps<typeof Icon>['name'];

export interface ThemeColors {
  primary: string;
  primarySoft: string;
  onPrimary: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  trackOff: string;
  success: string;
  successSoft: string;
  error: string;
  errorSoft: string;
  warning: string;
  gradientTop: string;
  shadow: string;
}
