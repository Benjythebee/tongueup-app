import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  Animated,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../types/common';


interface RollPickerProps {
  data: string[];
  onSelectionChange?: (selectedItem: string, selectedIndex: number) => void;
  initialSelectedIndex?: number;
  itemHeight?: number;
  visibleItems?: number;
  style?: any;
  textStyle?: any;
  selectedTextStyle?: any;
}

const RollPicker: React.FC<RollPickerProps> = ({
  data,
  onSelectionChange,
  initialSelectedIndex = 0,
  itemHeight = 15,
  visibleItems = 5,
  style,
  textStyle,
  selectedTextStyle,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const {colors} = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const containerHeight = visibleItems * itemHeight;
  const paddingVertical = (containerHeight - itemHeight) / 2;

  const styles = useMemo(() => createStyles(colors), [colors]);
  
  useEffect(() => {
    // Initial scroll to selected item
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: initialSelectedIndex * itemHeight,
        animated: false,
      });
    }, 100);
  }, [initialSelectedIndex, itemHeight]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    
    setSelectedIndex(clampedIndex);
    
    // Snap to the nearest item
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * itemHeight,
      animated: true,
    });
    
    if (onSelectionChange) {
      onSelectionChange(data[clampedIndex], clampedIndex);
    }
  };

  const renderItem = (item: string, index: number) => {
    const inputRange = [
      (index - 2) * itemHeight,
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
      (index + 2) * itemHeight,
    ];

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.2, 0.5, 1, 0.5, 0.2],
      extrapolate: 'clamp',
    });

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 0.9, 1, 0.9, 0.8],
      extrapolate: 'clamp',
    });

    const rotateX = scrollY.interpolate({
      inputRange,
      outputRange: ['45deg', '15deg', '0deg', '-15deg', '-45deg'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.itemContainer,
          {
            height: itemHeight,
            opacity,
            transform: [{ scale }, { rotateX }],
          },
        ]}
      >
        <Text
          style={[
            styles.itemText,
            textStyle,
            selectedIndex === index && selectedTextStyle,
          ]}
        >
          {item}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { height: containerHeight }, style]}>
      {/* Selection indicator overlay */}
      <View
        style={[
          styles.selectionIndicator,
          {
            top: paddingVertical,
            height: itemHeight,
          },
        ]}
      />
      
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingVertical,
        }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        onScroll={(event)=>{
          event.stopPropagation();
          event.preventDefault();
          handleScroll(event)
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        snapToInterval={itemHeight}
        decelerationRate="fast"
      >
        {data.map((item, index) => renderItem(item, index))}
      </ScrollView>
    </View>
  );
};

RollPicker.displayName = 'RollPicker';

export default RollPicker;

const createStyles =(colors:ThemeColors)=> StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: colors.textRollPicker,
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    // backgroundColor: 'rgba(0, 123, 255, 0.1)',
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderColor: 'rgba(0, 123, 255, 0.3)',
    zIndex: 1,
    pointerEvents: 'none',
  },
});