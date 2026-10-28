import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/tokens';
import AppText from './AppText';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  message,
  size = 'large',
  style,
  testID
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ActivityIndicator
        size={size}
        color={colors.primary}
        testID={`${testID}-spinner`}
      />
      {message && (
        <AppText variant="callout" tone="secondary" align="center" testID={`${testID}-message`}>
          {message}
        </AppText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    minHeight: 160,
  },
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
