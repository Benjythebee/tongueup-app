import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Touchable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, Tone, toneColors } from '../theme/tokens';
import { IconName } from '../types/common';
import AppText from './AppText';
import IconBadge from './IconBadge';

interface ChoiceTileProps {
  icon: IconName;
  label: string;
  tone?: Tone;
  onPress?: () => void;
}

/** Large tappable answer tile: tinted background, solid icon, short label */
const ChoiceTile: React.FC<ChoiceTileProps> = ({ icon, label, tone = 'primary', onPress }) => {
  const { colors } = useTheme();
  const { bg } = toneColors(colors, tone);
  const styles = useMemo(() => createStyles(bg), [bg]);

  return (
    <Touchable style={styles.tile} onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
      <IconBadge name={icon} tone={tone} size={52} solid style={styles.badge} />
      <AppText variant="callout" align="center">{label}</AppText>
    </Touchable>
  );
};

const createStyles = (bg: string) => StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: bg,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    borderRadius: radius.pill,
  },
});

export default ChoiceTile;
