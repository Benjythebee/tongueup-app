import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useTheme } from '../context/ThemeContext';
import { Tone, toneColors } from '../theme/tokens';
import { IconName } from '../types/common';

interface IconBadgeProps {
  name: IconName;
  tone?: Tone;
  /** Box size; the icon is half of it */
  size?: number;
  /** Solid tone background with white icon instead of the soft tint */
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Icon on a rounded, tinted square — used to lead rows, cards and states */
const IconBadge: React.FC<IconBadgeProps> = ({ name, tone = 'primary', size = 40, solid, style }) => {
  const { colors } = useTheme();
  const { fg, bg } = toneColors(colors, tone);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
          backgroundColor: solid ? fg : bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icon name={name} size={Math.round(size * 0.5)} color={solid ? colors.surface : fg} />
    </View>
  );
};

export default IconBadge;
