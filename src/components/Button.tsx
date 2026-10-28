import { Touchable } from "react-native-gesture-handler"
import {Text, StyleSheet, ViewStyle, StyleProp, Platform} from "react-native";

interface ButtonProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<ViewStyle>;
    label?: string;
}

const Button: React.FC<ButtonProps> = ({ onPress,label, style, textStyle }) => {

    // Same feedback as the former BorderlessButton: borderless ripple on Android, opacity on iOS
    return (<Touchable
            style={[defaultStyle.confirmButton, style]}
            {...Platform.select({
                android: { androidRipple: { borderless: true } },
                default: { activeOpacity: 0.3, animationDuration: 0 },
            })}
            onPress={() => {
                onPress && onPress();
            }}
            >
                <Text style={[defaultStyle.textStyle,textStyle]}>
                {label || 'Button'}
                </Text>
            </Touchable>)
}


const defaultStyle = StyleSheet.create({
    confirmButton:{
        backgroundColor: '#009A11',
        padding: 10,
        color: 'white',
        fontSize: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    textStyle:{
        color: 'white',
        fontSize: 20,
    }
})

Button.displayName = 'Button';

export default Button;