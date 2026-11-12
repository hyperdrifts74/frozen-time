import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { spriteFor } from '../assets';
import { THEME } from '../constants/theme';
import { formatMult, formatNum } from '../utils/format';

interface Props {
  speciesId: number;
  points: number;
  mult: number;
}

/** The species rises to the hook and the award drifts up and fades. */
export function CatchPopper({ speciesId, points, mult }: Props) {
  const rise = useRef(new Animated.Value(0)).current;
  const label = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.parallel([
      Animated.timing(rise, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(label, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]);
    seq.start();
    return () => {
      seq.stop();
    };
  }, [rise, label]);

  const spriteY = rise.interpolate({
    inputRange: [0, 1],
    outputRange: [60, -34],
  });
  const spriteOpacity = rise.interpolate({
    inputRange: [0, 0.25, 0.75, 1],
    outputRange: [0, 1, 1, 0.1],
  });
  const labelY = label.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const labelOpacity = label.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View pointerEvents="none" style={styles.wrap}>
      <Animated.Image
        source={spriteFor(speciesId)}
        style={[
          styles.sprite,
          { opacity: spriteOpacity, transform: [{ translateY: spriteY }] },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.labelWrap,
          { opacity: labelOpacity, transform: [{ translateY: labelY }] },
        ]}>
        <Text style={styles.points}>{'+' + formatNum(points)}</Text>
        <Text style={styles.mult}>{formatMult(mult)}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
  },
  labelWrap: { alignItems: 'center', marginTop: 4 },
  points: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.mint,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(6,32,47,0.8)',
    textShadowRadius: 6,
  },
  mult: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textLight,
  },
});

export default React.memo(CatchPopper);
