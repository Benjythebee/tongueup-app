import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onActionPress?: () => void;
  icon?: string;
  style?: object;
  testID?: string;
}

const EmptyState: React.FC<EmptyStateProps> = memo(({
  title,
  message,
  actionText,
  onActionPress,
  icon = '🔍',
  style,
  testID
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      minHeight: 300,
    },
    icon: {
      fontSize: 64,
      marginBottom: 16,
      opacity: 0.6,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
      maxWidth: 280,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      elevation: 2,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    actionButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.icon} testID={`${testID}-icon`}>
        {icon}
      </Text>
      
      <Text style={styles.title} testID={`${testID}-title`}>
        {title}
      </Text>
      
      <Text style={styles.message} testID={`${testID}-message`}>
        {message}
      </Text>
      
      {actionText && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
          activeOpacity={0.8}
          testID={`${testID}-action`}
        >
          <Text style={styles.actionButtonText}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;