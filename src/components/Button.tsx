import { useMemo } from "react";
import { Touchable } from "react-native-gesture-handler"
import { StyleSheet, ViewStyle, StyleProp, Platform, View } from "react-native";
import Icon from "@react-native-vector-icons/lucide";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, typography } from "../theme/tokens";
import { IconName, ThemeColors } from "../types/common";
import AppText from "./AppText";

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps {
    label: string;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: IconName;
    fullWidth?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

const variantColors = (colors: ThemeColors, variant: ButtonVariant) => {
    switch (variant) {
        case 'secondary': return { bg: colors.primarySoft, fg: colors.primary };
        case 'danger': return { bg: colors.errorSoft, fg: colors.error };
        case 'ghost': return { bg: 'transparent', fg: colors.textSecondary };
        default: return { bg: colors.primary, fg: colors.onPrimary };
    }
};

const Button: React.FC<ButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    fullWidth,
    disabled,
    style,
}) => {
    const { colors } = useTheme();
    const { bg, fg } = variantColors(colors, variant);
    const styles = useMemo(() => createStyles(size), [size]);

    // Layout and the disabled dimming live on a wrapper: Touchable drives its own opacity
    // for press feedback, which overrides an opacity style on web
    return (
        <View style={[styles.wrapper, fullWidth && styles.fullWidth, disabled && styles.disabled, style]}>
        <Touchable
            style={[styles.button, { backgroundColor: bg }]}
            disabled={disabled}
            {...Platform.select({
                android: { androidRipple: { color: variant === 'primary' ? 'rgba(255,255,255,0.25)' : colors.border } },
                default: { activeOpacity: 0.7 },
            })}
            onPress={() => onPress?.()}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
        >
            <View style={styles.content}>
                {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} color={fg} />}
                <AppText style={[styles.label, { color: fg }]} numberOfLines={1}>
                    {label}
                </AppText>
            </View>
        </Touchable>
        </View>
    )
}

const createStyles = (size: ButtonSize) => StyleSheet.create({
    button: {
        minHeight: size === 'sm' ? 40 : 52,
        paddingHorizontal: size === 'sm' ? spacing.lg : spacing.xxl,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    wrapper: {
        alignSelf: 'center',
    },
    fullWidth: {
        alignSelf: 'stretch',
    },
    disabled: {
        opacity: 0.45,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: size === 'sm' ? { ...typography.callout, fontWeight: '600' } : typography.headline,
})

Button.displayName = 'Button';

export default Button;
