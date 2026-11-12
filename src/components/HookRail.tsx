import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HOOK_RAIL_H, LANE_W, LANES } from '../constants/config';
import { THEME } from '../constants/theme';

interface Props {
  lane: number;
  stepMs: number;
  frozen: boolean;
  shakeNonce: number;
}

const MARKER_W = 38;

export function laneCenterX(lane: number): number {
  return lane * LANE_W + LANE_W / 2;
}

/**
 * The hook walks the lane centres. The logical lane lives in the scene hook,
 * so what the player sees and what a drop resolves against never drift apart.
 */
export function HookRail({ lane, stepMs, frozen, shakeNonce }: Props) {
  const x = useRef(new Animated.Value(laneCenterX(0) - MARKER_W / 2)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = laneCenterX(lane) - MARKER_W / 2;
    const animation = Animated.timing(x, {
      toValue: target,
      duration: Math.max(90, stepMs),
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [lane, stepMs, x]);

  useEffect(() => {
    if (shakeNonce <= 0) {
      return;
    }
    const animation = Animated.sequence([
      Animated.timing(shake, { toValue: 5, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 5, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 90, useNativeDriver: true }),
    ]);
    animation.start();
    return () => {
      animation.stop();
    };
  }, [shakeNonce, shake]);

  const tx = Animated.add(x, shake);
  const color = frozen ? THEME.colors.violet : THEME.colors.textLight;

  return (
    <View pointerEvents="none" style={styles.rail}>
      <Animated.View
        pointerEvents="none"
        style={[styles.marker, { transform: [{ translateX: tx }] }]}>
        <View style={[styles.bar, { backgroundColor: color }]} />
        <Svg width={20} height={26} viewBox="0 0 20 26">
          <Path
            d="M10 2 V13 C10 19 4 19 4 13"
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <View
          style={[
            styles.guide,
            {
              backgroundColor: frozen
                ? 'rgba(110,91,216,0.45)'
                : 'rgba(0,166,203,0.35)',
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: LANE_W * LANES,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: MARKER_W,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    width: MARKER_W - 10,
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  guide: {
    width: 1,
    flex: 1,
    marginTop: 2,
    marginBottom: HOOK_RAIL_H / 2,
  },
});

export default React.memo(HookRail);
