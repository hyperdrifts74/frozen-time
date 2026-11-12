import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LANE_W, RIPPLE_MS } from '../constants/config';
import { THEME } from '../constants/theme';

interface Props {
  /** Tier colour for a fish, dull ice for a decoy. */
  color: string;
  rings: number;
  decoy: boolean;
  frozen: boolean;
  assist: boolean;
}

const RING_BASE = Math.round(LANE_W * 0.82);

/**
 * Growing rings = a fish. Shrinking, dull rings = empty water. That shrink is
 * the tell the player has to read. Only transform/opacity are animated, so the
 * native driver is safe here.
 */
export function Ripple({ color, rings, decoy, frozen, assist }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const progRef = useRef(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      progRef.current = value;
    });
    return () => {
      progress.removeListener(id);
    };
  }, [progress]);

  useEffect(() => {
    if (frozen) {
      // Freeze halts ripple decay: stop where we are and remember the phase.
      progress.stopAnimation(v => {
        progRef.current = v;
      });
      return;
    }
    const remaining = Math.max(120, RIPPLE_MS * (1 - progRef.current));
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [frozen, progress]);

  const count = Math.max(1, Math.min(3, rings));
  const ringColor = decoy ? 'rgba(157,206,219,0.45)' : color;
  const items = [];

  for (let i = 0; i < count; i++) {
    const start = i * 0.12 + 0.001;
    const scale = progress.interpolate({
      inputRange: [0, start, 1],
      outputRange: decoy ? [1.15, 1.15, 0.4] : [0.3, 0.3, 1.15],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, start, 0.33, 0.78, 1],
      outputRange: [0, 0, 1, 0.7, 0],
      extrapolate: 'clamp',
    });
    items.push(
      <Animated.View
        key={'r' + i}
        pointerEvents="none"
        style={[
          styles.ring,
          { borderColor: ringColor, opacity, transform: [{ scale }] },
        ]}
      />,
    );
  }

  if (assist) {
    // Timing arc: closes onto the ring exactly across the 1800 ms lifecycle.
    const arcScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1.5, 0.55],
      extrapolate: 'clamp',
    });
    const arcOpacity = progress.interpolate({
      inputRange: [0, 0.3, 0.61, 0.72, 1],
      outputRange: [0.35, 0.5, 0.95, 0.5, 0],
      extrapolate: 'clamp',
    });
    items.push(
      <Animated.View
        key="arc"
        pointerEvents="none"
        style={[
          styles.arc,
          { opacity: arcOpacity, transform: [{ scale: arcScale }] },
        ]}
      />,
    );
  }

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: RING_BASE,
    height: RING_BASE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_BASE,
    height: RING_BASE,
    borderRadius: RING_BASE / 2,
    borderWidth: 2,
  },
  arc: {
    position: 'absolute',
    width: RING_BASE,
    height: RING_BASE,
    borderRadius: RING_BASE / 2,
    borderWidth: 1,
    borderColor: THEME.colors.mint,
    borderStyle: 'dashed',
  },
});

export default React.memo(Ripple);
