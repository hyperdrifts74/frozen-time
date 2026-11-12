import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lock } from 'lucide-react-native';
import { SPOT_CARD_H } from '../constants/config';
import { THEME } from '../constants/theme';
import { SpotConfig } from '../game/spots';
import { formatNum } from '../utils/format';

interface Props {
  spot: SpotConfig;
  unlocked: boolean;
  best: number;
  onPress: (spot: SpotConfig, unlocked: boolean) => void;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const TIER_BY_DEPTH = [
  THEME.colors.accent,
  THEME.colors.accent,
  THEME.colors.accentDeep,
  THEME.colors.accentDeep,
  THEME.colors.violet,
  THEME.colors.violet,
];

function rippleSpeed(sweepMs: number): string {
  if (sweepMs <= 1650) {
    return 'FAST';
  }
  if (sweepMs <= 2050) {
    return 'MEDIUM';
  }
  return 'CALM';
}

/** One Level Select row. Locked rows always carry their unlock text. */
export function SpotCard({ spot, unlocked, best, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const accent = TIER_BY_DEPTH[spot.index] || THEME.colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spot.name}
      accessibilityState={{ disabled: !unlocked }}
      hitSlop={HIT}
      onPress={() => onPress(spot, unlocked)}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.98,
          ...THEME.spring.press,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          ...THEME.spring.press,
          useNativeDriver: true,
        }).start();
      }}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          unlocked ? null : styles.cardLocked,
          { transform: [{ scale }] },
        ]}>
        <View style={[styles.index, { backgroundColor: accent + '29' }]}>
          <Text style={[styles.indexText, { color: accent }]}>
            {spot.index + 1}
          </Text>
        </View>

        <View style={styles.mid}>
          <Text numberOfLines={1} style={styles.name}>
            {spot.name}
          </Text>
          <Text numberOfLines={1} style={styles.sub}>
            {'RIPPLE ' + rippleSpeed(spot.sweepMs) + ' · DECOY ' + spot.decoyPct + '%'}
          </Text>
          <Text numberOfLines={1} style={styles.best}>
            {best > 0 ? 'BEST ' + formatNum(best) : 'TARGET ' + formatNum(spot.target)}
          </Text>
        </View>

        {unlocked ? (
          <View style={styles.startWrap}>
            <LinearGradient
              colors={[...THEME.gradients.cta]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startFill}
            />
            <Text style={styles.startText}>START</Text>
          </View>
        ) : (
          <View style={styles.lockWrap}>
            <Lock size={18} color={THEME.colors.iceLocked} strokeWidth={2.2} />
            <Text style={styles.lockText}>{spot.unlockAt + ' CATCHES'}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: SPOT_CARD_H },
  card: {
    width: '100%',
    height: SPOT_CARD_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: THEME.radius.tile,
    backgroundColor: THEME.surface.lightStrong,
    borderWidth: 1,
    borderColor: THEME.surface.borderLight,
  },
  cardLocked: { opacity: 0.55 },
  index: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: { fontSize: 20, fontWeight: '800' },
  mid: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: THEME.colors.textDark },
  sub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textDarkSoft,
  },
  best: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.accentDeep,
    fontVariant: ['tabular-nums'],
  },
  startWrap: {
    width: 82,
    height: 40,
    borderRadius: THEME.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  startFill: { ...StyleSheet.absoluteFillObject },
  startText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.white,
  },
  lockWrap: { width: 82, alignItems: 'center', gap: 3 },
  lockText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: THEME.colors.textDim,
  },
});

export default SpotCard;
