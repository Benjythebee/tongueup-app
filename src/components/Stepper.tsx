import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Touchable } from 'react-native-gesture-handler';
import Icon from '@react-native-vector-icons/lucide';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/tokens';
import { IconName, ThemeColors } from '../types/common';
import AppText from './AppText';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** − value + counter */
const Stepper: React.FC<StepperProps> = ({ value, onChange, min = 0, max = 10 }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderButton = (icon: IconName, next: number, disabled: boolean) => (
    <Touchable
      style={[styles.button, disabled && styles.disabled]}
      disabled={disabled}
      onPress={() => onChange(next)}
      activeOpacity={0.6}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={icon === 'plus' ? '+1' : '-1'}
    >
      <Icon name={icon} size={18} color={colors.primary} />
    </Touchable>
  );

  return (
    <View style={styles.container}>
      {renderButton('minus', value - 1, value <= min)}
      <AppText variant="headline" align="center" style={styles.value}>{value}</AppText>
      {renderButton('plus', value + 1, value >= max)}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  value: {
    minWidth: 32,
  },
});

export default Stepper;
