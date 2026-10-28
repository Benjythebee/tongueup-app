import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Touchable } from 'react-native-gesture-handler';
import Icon from '@react-native-vector-icons/lucide';
import { useTheme } from '../context/ThemeContext';
import { spacing, Tone } from '../theme/tokens';
import { IconName } from '../types/common';
import AppText from './AppText';
import IconBadge from './IconBadge';

interface ListRowProps {
  title: string;
  description?: string;
  icon?: IconName;
  iconTone?: Tone;
  /** Accessory at the end of the row (toggle, stepper, segmented control…) */
  right?: ReactNode;
  /** Makes the whole row tappable and shows a chevron when no `right` is given */
  onPress?: () => void;
}

/** Icon + label (+ description) + accessory row, for settings-style lists */
const ListRow: React.FC<ListRowProps> = ({ title, description, icon, iconTone = 'neutral', right, onPress }) => {
  const { colors } = useTheme();

  const content = (
    <View style={styles.row}>
      {icon && <IconBadge name={icon} tone={iconTone} size={36} />}
      <View style={styles.text}>
        <AppText variant="headline">{title}</AppText>
        {description && <AppText variant="caption" tone="secondary">{description}</AppText>}
      </View>
      {right ?? (onPress && <Icon name="chevron-right" size={20} color={colors.textMuted} />)}
    </View>
  );

  if (!onPress) {
    return content;
  }
  return (
    <Touchable onPress={onPress} activeOpacity={0.6} accessibilityRole="button">
      {content}
    </Touchable>
  );
};

/** Hairline separator between rows */
export const Divider: React.FC = () => {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});

export default ListRow;
