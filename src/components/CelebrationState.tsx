import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, Tone } from '../theme/tokens';
import { IconName } from '../types/common';
import AppText from './AppText';
import IconBadge from './IconBadge';

interface CelebrationStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  tone?: Tone;
}

/** Centered icon + message shown after the user completes an action */
const CelebrationState: React.FC<CelebrationStateProps> = ({ title, message, icon = 'party-popper', tone = 'success' }) => (
  <View style={styles.container}>
    <IconBadge name={icon} tone={tone} size={56} />
    <AppText variant="headline" align="center">{title}</AppText>
    {message && <AppText variant="callout" tone="secondary" align="center">{message}</AppText>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
});

export default CelebrationState;
