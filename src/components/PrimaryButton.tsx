import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { THEME } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * Primary CTA — text only. A clean button beats a crooked one with a glyph,
 * so no icon ever goes inside this component.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  height = 60,
  style,
  testID,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (disabled) {
      return;
    }
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

  return (
    <Pressable
      testID={testID}
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
          THEME.glow.cta,
          { height, opacity: disabled ? 0.45 : 1, transform: [{ scale }] },
        ]}>
        <LinearGradient
          colors={[...THEME.gradients.cta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { height }]}
        />
        <Image source={ASSETS.buttonRect} style={styles.plate} />
        <View style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: { ...StyleSheet.absoluteFillObject },
  plate: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.18,
    resizeMode: 'cover',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: THEME.colors.white,
  },
});

export default PrimaryButton;
