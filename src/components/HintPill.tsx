import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { THEME } from '../constants/theme';

interface Props {
  text: string;
  visible: boolean;
}

/**
 * Names the gesture AND its result, and stays long enough to land in a review
 * frame. Re-shown at the start of every scene.
 */
export function HintPill({ text, visible }: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 400,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [visible, fade]);

  return (
    <Animated.View pointerEvents="none" style={[styles.pill, { opacity: fade }]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 18,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.chip,
    backgroundColor: 'rgba(6,32,47,0.68)',
    borderWidth: 1,
    borderColor: THEME.surface.borderDark,
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.textLight,
    textAlign: 'center',
  },
});

export default HintPill;
