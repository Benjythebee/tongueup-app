import React, { memo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  style?: object;
  testID?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  message = 'Loading...',
  size = 'large',
  style,
  testID
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 20,
    },
    message: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ActivityIndicator
        size={size}
        color={colors.primary}
        testID={`${testID}-spinner`}
      />
      {message && (
        <Text style={styles.message} testID={`${testID}-message`}>
          {message}
        </Text>
      )}
    </View>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;