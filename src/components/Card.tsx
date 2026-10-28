import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { elevation, radius, spacing, Tone } from '../theme/tokens';
import { IconName, ThemeColors } from '../types/common';
import AppText from './AppText';
import IconBadge from './IconBadge';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: Tone;
  /** Rendered at the end of the header row (e.g. a toggle or a link) */
  headerRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const CardComponent: React.FC<React.PropsWithChildren<CardProps>> = ({
  title,
  subtitle,
  icon,
  iconTone,
  headerRight,
  style,
  contentContainerStyle,
  children,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasHeader = !!(title || subtitle || icon || headerRight);

  return (
    <View
      style={[styles.container, style]}
      testID={title ? title.toLowerCase().replace(/\s+/g, '-') + '-card' : undefined}
    >
      {hasHeader && (
        <View style={styles.header}>
          {icon && <IconBadge name={icon} tone={iconTone} />}
          <View style={styles.headerText}>
            {title && <AppText variant="title">{title}</AppText>}
            {subtitle && <AppText variant="caption" tone="secondary">{subtitle}</AppText>}
          </View>
          {headerRight}
        </View>
      )}
      <View style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    ...elevation(colors),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  content: {
    gap: spacing.lg,
  },
});

export default CardComponent;
