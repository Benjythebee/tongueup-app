import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

interface CardProps {
  title:string,
  style?: object;
  contentContainerStyle?: StyleProp<ViewStyle>
;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = screenWidth - (CARD_MARGIN * 2);

const CardComponent:React.FC<React.PropsWithChildren<CardProps>> =({ 
  style,
  title,
  contentContainerStyle,
  children
}) => {

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);


  return (
    <View
      style={[styles.container, style]}
      testID={title.toLowerCase().replace(/\s+/g, '-') + '-card'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={[styles.contentContainer,contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN,
    marginVertical: 8,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    padding:4,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: CARD_WIDTH,
  },
  header: {
    padding:4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 29,
  },
  contentContainer: {
    fontSize: 18,
    paddingHorizontal:8,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
});


export default CardComponent;