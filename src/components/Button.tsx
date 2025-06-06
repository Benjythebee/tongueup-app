import { BorderlessButton, Pressable } from "react-native-gesture-handler"
import {Text, StyleSheet, ViewStyle, StyleProp} from "react-native";

interface ButtonProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<ViewStyle>;
    label?: string;
}

const Button: React.FC<ButtonProps> = ({ onPress,label, style, textStyle }) => {

    return (<BorderlessButton 
            style={[defaultStyle.confirmButton, style]}
            onPress={() => {
                onPress && onPress();
            }}
            >
                <Text style={[defaultStyle.textStyle,textStyle]}>
                {label || 'Button'}
                </Text>
            </BorderlessButton>)
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