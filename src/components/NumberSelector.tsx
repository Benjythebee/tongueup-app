import { useMemo, useState } from 'react';
import { View,StyleSheet, Text, StyleProp, TextStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../types/common';
  const data = Array(10).fill(0).map((_, index) => (index+1)).map((item) => ({
    label: item.toString(),
    value: item.toString(),
  }))
  // const data = [
  //   { label: 'Item 1', value: '1' },
  //   { label: 'Item 2', value: '2' },
  //   { label: 'Item 3', value: '3' },
  //   { label: 'Item 4', value: '4' },
  //   { label: 'Item 5', value: '5' },
  //   { label: 'Item 6', value: '6' },
  //   { label: 'Item 7', value: '7' },
  //   { label: 'Item 8', value: '8' },
  // ];
interface DropdownProps {
    onSelected?: (value: string) => void;
    selectedTextStyle?: StyleProp<TextStyle>;
    placeholderStyle?: StyleProp<TextStyle>;
    dropDownStyle?: StyleProp<TextStyle>;
}

  
const NumberSelector = (props:DropdownProps) => {
  const {onSelected} = props;
  const {colors} = useTheme();
    const [value, setValue] = useState('1');
    const [isFocus, setIsFocus] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

    // const renderItem = ({ item, selected}: {item: { label:string, value: string }, selected?: boolean}) => {
    //     return (
    //         <View style={styles.itemContainerStyle}>
    //             <Text style={[styles.itemTextStyle,selected && props.selectedTextStyle]}>{item.label}</Text>
    //         </View>
    //     );
    // }

    return (
        <View style={[styles.container, props.dropDownStyle]}>
          <Dropdown
              itemContainerStyle={styles.itemContainerStyle}
              containerStyle={styles.listContainer}
              itemTextStyle={styles.itemTextStyle}
              style={[styles.dropdown, isFocus ?{ borderColor: 'blue' }:{}]}
              placeholderStyle={props.placeholderStyle}
              selectedTextStyle={[styles.selectedTextStyle,props.selectedTextStyle]}
              data={data}
              search={false}
              // renderItem={renderItem}
              // maxHeight={100}
              labelField="label"
              valueField="value"
              placeholder={value ? value : '1'}
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setValue(item.value);
                setIsFocus(false);
                onSelected && onSelected(item.value);
              }}
          />
        </View>
    );
};

export default NumberSelector;


    const createStyles = (colors:ThemeColors)=> StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: 0,
      // borderRadius: 8,
      color:  colors.text,
      width: 70,
    },
    // Styling for list container
    listContainer:{
      maxHeight:200
    },
    // Styling for item container in list
    itemContainerStyle:{
      backgroundColor: colors.background,
      // padding:8,
      paddingHorizontal: 0,
      textAlign: 'center',
      justifyContent: 'center',
    },
    selectedTextStyle:{
      color: colors.text,
    },
    // Styling for view container
    dropdown: {
      height: 30,
      backgroundColor: colors.background,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Styling for text item in list
    itemTextStyle:{
      color: colors.text,
      textAlign: 'center',
      justifyContent: 'center',
      paddingHorizontal:0,
      paddingVertical:1,
      lineHeight:10,
    },
    label: {
      position: 'absolute',
      backgroundColor: colors.background,
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
})