
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/tokens';
import { ThemeColors } from '../types/common';
import AppText from './AppText';

interface ScreenWrapperProps {
  title: string;
  /** Small uppercase line above the title (e.g. today's date) */
  eyebrow?: string;
  subtitle?: string;
}

// Scroll distance over which the status bar backdrop fades in
const SCRIM_FADE_DISTANCE = 32;

/** Scrollable screen with the shared header and soft brand gradient behind it */
export const ScreenWrapper: React.FC<PropsWithChildren<ScreenWrapperProps>> = ({ title, eyebrow, subtitle, children }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // The status bar is transparent, so content scrolled under it needs a backdrop
  const scrimOpacity = scrollY.interpolate({
    inputRange: [0, SCRIM_FADE_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientTop, 'transparent']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.header}>
          {eyebrow && <AppText variant="overline" tone="primary">{eyebrow}</AppText>}
          <AppText variant="display" accessibilityRole="header">{title}</AppText>
          {subtitle && <AppText tone="secondary">{subtitle}</AppText>}
        </View>
        {children}
      </Animated.ScrollView>
      <Animated.View
        pointerEvents="none"
        style={[styles.statusBarScrim, { height: insets.top, opacity: scrimOpacity }]}
      />
    </View>
  )
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 360,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusBarScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
})
