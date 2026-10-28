import React from 'react';
import { Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}

/** Themed on/off switch */
const Toggle: React.FC<ToggleProps> = ({ value, onValueChange, accessibilityLabel }) => {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.trackOff, true: colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.trackOff}
      accessibilityLabel={accessibilityLabel}
    />
  );
};

export default Toggle;
