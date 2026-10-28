import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, Tone, toneColors } from '../theme/tokens';
import { ThemeColors } from '../types/common';
import AppText from './AppText';

interface StatTileProps {
  label: string;
  value: string | number;
  tone?: Tone;
}

/** Big number with a colored dot + label, doubles as a chart legend */
const StatTile: React.FC<StatTileProps> = ({ label, value, tone = 'primary' }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { fg } = toneColors(colors, tone);

  return (
    <View style={styles.tile}>
      <AppText variant="stat">{value}</AppText>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: fg }]} />
        <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.label}>{label}</AppText>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    flexShrink: 1,
  },
});

export default StatTile;
