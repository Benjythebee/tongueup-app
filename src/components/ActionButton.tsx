

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '@react-native-vector-icons/lucide';
import { ThemeColors } from '../types/common';

interface ConfirmButtonProps {
  text?: string;
  icon:'check' | 'x';
  variant?: 'small'|'normal'
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle> | undefined;
  iconStyle?: StyleProp<ViewStyle> | undefined;
}

const ActionButton: React.FC<ConfirmButtonProps> = memo(({
  text,
  variant = 'normal',
  icon = 'check',
  iconStyle,
  onActionPress,
  style,
}) => {
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors,variant), [colors,variant]);

  return (
    <Pressable
    onPress={onActionPress}
    style={({pressed})=>[styles.container, style,pressed?{ backgroundColor:'#afafaf', color:'white'}:{}]} testID={'confirm-button'}>
      <Icon name={icon} style={iconStyle?iconStyle:{}} size={32} color={'#ffffff'} />
      
    {text && <Text style={styles.text}>
      {text}
    </Text>}
    </Pressable>
  );
});

ActionButton.displayName = 'ActionButton';

export default ActionButton;


const createStyles = (colors:any,variant:'small'|'normal'='normal')=>StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      paddingHorizontal: variant=='small'?2:20,
      paddingVertical: variant=='small'?2:10,
      minHeight: 20,
    },
    text: {
      fontSize: variant=='small'?14:16,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 280,
    }
  });

