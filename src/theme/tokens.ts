import { TextStyle, ViewStyle } from 'react-native';
import { ThemeColors } from '../types/common';

// Palette built around the app icon: plum purple, warm cream and a calm green / soft coral
// pair for "tongue on the roof" vs "not quite".
export const lightColors: ThemeColors = {
  primary: '#6B3FA0',
  primarySoft: '#EFE6F8',
  onPrimary: '#FFFFFF',
  background: '#FAF6F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F4EFF6',
  text: '#211B27',
  textSecondary: '#5F5768',
  textMuted: '#968D9E',
  border: '#ECE4EF',
  trackOff: '#DCD3E0',
  success: '#2E9467',
  successSoft: '#E1F3EA',
  error: '#D4574C',
  errorSoft: '#FBE7E4',
  warning: '#D98E1F',
  gradientTop: 'rgba(150, 100, 205, 0.20)',
  shadow: '#3B2550',
};

export const darkColors: ThemeColors = {
  primary: '#BC9BEA',
  primarySoft: '#33284A',
  onPrimary: '#1E1230',
  background: '#131017',
  surface: '#1D1923',
  surfaceMuted: '#28222F',
  text: '#F3EEF7',
  textSecondary: '#BAB0C4',
  textMuted: '#857B90',
  border: '#2E2836',
  trackOff: '#3F3748',
  success: '#5CCB98',
  successSoft: '#1B3328',
  error: '#F2877C',
  errorSoft: '#3D2424',
  warning: '#F2B256',
  gradientTop: 'rgba(188, 155, 234, 0.14)',
  shadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  stat: { fontSize: 26, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

// Soft, diffuse shadow for raised surfaces (cards, selected segments)
export const elevation = (colors: ThemeColors, level: 1 | 2 = 1): ViewStyle => ({
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: level * 3 },
  shadowOpacity: 0.07,
  shadowRadius: level * 8,
  elevation: level * 2,
});

export type Tone = 'primary' | 'success' | 'error' | 'neutral';

// Foreground / soft background pair for a semantic tone
export const toneColors = (colors: ThemeColors, tone: Tone) => {
  switch (tone) {
    case 'success':
      return { fg: colors.success, bg: colors.successSoft };
    case 'error':
      return { fg: colors.error, bg: colors.errorSoft };
    case 'neutral':
      return { fg: colors.textSecondary, bg: colors.surfaceMuted };
    default:
      return { fg: colors.primary, bg: colors.primarySoft };
  }
};
