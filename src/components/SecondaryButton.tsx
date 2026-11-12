import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  tone?: 'dark' | 'light' | 'warn';
  height?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Secondary CTA — translucent fill + 1 px border, text only (no icon). */
export function SecondaryButton({
  label,
  onPress,
  tone = 'dark',
  height = 48,
  style,
  disabled = false,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      ...THEME.spring.press,
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      ...THEME.spring.press,
      useNativeDriver: true,
    }).start();
  };

  const toneStyle =
    tone === 'light'
      ? styles.light
      : tone === 'warn'
      ? styles.warn
      : styles.dark;
  const textColor =
    tone === 'light'
      ? THEME.colors.accentDeep
      : tone === 'warn'
      ? THEME.colors.warn
      : THEME.colors.textLight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      hitSlop={HIT}
      style={[styles.press, { height }, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          toneStyle,
          { height, opacity: disabled ? 0.45 : 1, transform: [{ scale }] },
        ]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  wrap: {
    width: '100%',
    borderRadius: THEME.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: THEME.surface.onDark,
    borderColor: THEME.surface.borderDarkSoft,
  },
  light: {
    backgroundColor: THEME.surface.light,
    borderColor: THEME.surface.borderLight,
  },
  warn: {
    backgroundColor: 'rgba(224,115,79,0.14)',
    borderColor: THEME.colors.warn,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});

export default SecondaryButton;
