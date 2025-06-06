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

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  surface: string;
  text: string;
  textSecondary: string;
  textRollPicker: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}