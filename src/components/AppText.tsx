import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography, TypographyVariant } from '../theme/tokens';
import { ThemeColors } from '../types/common';

export type TextTone = 'default' | 'secondary' | 'muted' | 'primary' | 'onPrimary' | 'success' | 'error';

const toneToColor = (colors: ThemeColors, tone: TextTone) => {
  switch (tone) {
    case 'secondary': return colors.textSecondary;
    case 'muted': return colors.textMuted;
    case 'primary': return colors.primary;
    case 'onPrimary': return colors.onPrimary;
    case 'success': return colors.success;
    case 'error': return colors.error;
    default: return colors.text;
  }
};

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
}

/** Text that follows the app's type scale and theme colors */
const AppText: React.FC<AppTextProps> = ({ variant = 'body', tone = 'default', align, style, ...rest }) => {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: toneToColor(colors, tone) }, align && { textAlign: align }, style]}
    />
  );
};

export default AppText;
