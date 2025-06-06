
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, useMemo } from 'react';
import {Dimensions, SafeAreaView, StyleSheet} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const ScreenWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const height = Dimensions.get("window").height;
  const insets = useSafeAreaInsets();
  const {colors } = useTheme();

  const style = useMemo(() => createStyles(colors), [colors]);
    return (
    <SafeAreaView style={style.container}>
      <LinearGradient
        colors={["rgba(255, 193, 247, 0.8)", "transparent"]}
        style={[style.background,{height:height-insets.bottom+20}]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.15, y: 0.35 }}
      >
        {children}
    </LinearGradient>
</SafeAreaView>
    )
}

const createStyles = (colors:any)=> StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    background: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      // height: 300,
    }
})