import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

interface Props {
  accent?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** 'lg' is the hero PLAY tile, 'sm' the side and route tiles. */
  size?: 'lg' | 'sm';
  label?: string;
  padding?: number;
  children: React.ReactNode;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** The Menu / Progress bento surface with its accent dot. */
export function BentoTile({
  accent = THEME.colors.accent,
  onPress,
  style,
  size = 'sm',
  label,
  padding,
  children,
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

  const body = (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.tile,
        size === 'lg' ? styles.tileLg : styles.tileSm,
        THEME.glow.tile,
        padding === undefined ? null : { padding },
        onPress ? { transform: [{ scale }] } : null,
      ]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      {children}
    </Animated.View>
  );

  if (!onPress) {
    return <View style={[styles.slot, style]}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      hitSlop={HIT}
      style={[styles.slot, style]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  tile: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME.surface.lightStrong,
    borderWidth: 1,
    borderColor: THEME.surface.borderLight,
    overflow: 'hidden',
  },
  tileLg: { borderRadius: THEME.radius.card, padding: 14 },
  tileSm: { borderRadius: THEME.radius.tile, padding: 12 },
  dot: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default BentoTile;
