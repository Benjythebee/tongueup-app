import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Touchable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { elevation, radius, spacing } from '../theme/tokens';
import { ThemeColors } from '../types/common';
import AppText from './AppText';

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill-shaped picker for a small set of mutually exclusive options */
const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Touchable
            key={option.value}
            style={[styles.segment, selected && styles.selected]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <AppText variant="callout" tone={selected ? 'primary' : 'secondary'} style={selected && styles.selectedText}>
              {option.label}
            </AppText>
          </Touchable>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: {
    paddingVertical: spacing.sm - 1,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: colors.surface,
    ...elevation(colors),
  },
  selectedText: {
    fontWeight: '700',
  },
});

export default SegmentedControl;
