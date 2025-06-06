import { useMemo, useState } from 'react';
import { View,StyleSheet, Text, StyleProp, TextStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../types/common';
import { useTranslation } from 'react-i18next';

  const data = [
    { label: 'English', value: 'en' },
    { label: 'Francais', value: 'fr' },
  ];
interface LanguageDropdownProps {
    selectedTextStyle?: StyleProp<TextStyle>;
    placeholderStyle?: StyleProp<TextStyle>;
    dropDownStyle?: StyleProp<TextStyle>;
}

  
const LanguageSelector = (props:LanguageDropdownProps) => {
  const {i18n} = useTranslation();
 
  const {colors} = useTheme();
    const [value, setValue] = useState(i18n.language);
    const [isFocus, setIsFocus] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const setLocal = (lang: string) => {
    i18n.changeLanguage(lang)
  }

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
                setLocal(item.value);
              }}
          />
        </View>
    );
};

export default LanguageSelector;


    const createStyles = (colors:ThemeColors)=> StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: 0,
      // borderRadius: 8,
      color:  colors.text,
      width: 120,
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
      height: 40,
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