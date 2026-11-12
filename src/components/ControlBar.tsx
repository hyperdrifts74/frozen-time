import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import {
  CONTROL_BAR_BOTTOM,
  CONTROL_BAR_H,
} from '../constants/config';
import { THEME } from '../constants/theme';
import { formatMult } from '../utils/format';
import PrimaryButton from './PrimaryButton';

interface Props {
  onDrop: () => void;
  onFreeze: () => void;
  freezePct: number;
  streakMult: number;
  frozen: boolean;
}

const METER_W = 110;
const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function streakColor(mult: number): string {
  if (mult >= 3) {
    return THEME.colors.mint;
  }
  if (mult >= 1.5) {
    return THEME.colors.accent;
  }
  return THEME.colors.textLightSoft;
}

/** Floating controls — it never covers the lanes' active ripple zone. */
export function ControlBar({
  onDrop,
  onFreeze,
  freezePct,
  streakMult,
  frozen,
}: Props) {
  // width is NOT a native-driver property: this is the one JS-driven animation.
  const meter = useRef(new Animated.Value(0)).current;
  const freezeScale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const ready = freezePct >= 1;

  useEffect(() => {
    const animation = Animated.timing(meter, {
      toValue: Math.max(0, Math.min(1, freezePct)) * METER_W,
      duration: 240,
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [freezePct, meter]);

  const pressFreeze = () => {
    if (ready) {
      onFreeze();
      return;
    }
    Animated.sequence([
      Animated.timing(shake, { toValue: 4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.bar}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.streakChip,
            { borderColor: streakColor(streakMult) + '66' },
          ]}>
          <Text style={[styles.streakText, { color: streakColor(streakMult) }]}>
            {'STREAK ' + formatMult(streakMult)}
          </Text>
        </View>
        <View style={styles.meterSide}>
          <Text style={styles.meterLabel}>
            {frozen ? 'FROZEN' : ready ? 'READY' : 'FREEZE'}
          </Text>
          <View style={styles.meterTrack}>
            <Animated.View
              pointerEvents="none"
              style={[styles.meterFillWrap, { width: meter }]}>
              <LinearGradient
                colors={[...THEME.gradients.freezeMeter]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.meterFill}
              />
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.dropSlot}>
          <PrimaryButton label="DROP LINE" onPress={onDrop} height={60} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="FREEZE"
          accessibilityState={{ disabled: !ready }}
          hitSlop={HIT}
          onPress={pressFreeze}
          onPressIn={() => {
            Animated.spring(freezeScale, {
              toValue: 0.97,
              ...THEME.spring.press,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(freezeScale, {
              toValue: 1,
              ...THEME.spring.press,
              useNativeDriver: true,
            }).start();
          }}
          style={styles.freezePress}>
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.freezeBtn,
              ready ? styles.freezeOn : styles.freezeOff,
              { transform: [{ scale: freezeScale }, { translateX: shake }] },
            ]}>
            <Image source={ASSETS.buttonRound} style={styles.freezePlate} />
            <View style={styles.row}>
              <Text style={styles.freezeText}>FREEZE</Text>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: CONTROL_BAR_BOTTOM,
    height: CONTROL_BAR_H,
    borderRadius: THEME.radius.card,
    backgroundColor: THEME.surface.dark,
    borderWidth: 1,
    borderColor: THEME.surface.borderDark,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  topRow: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakChip: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    backgroundColor: 'rgba(234,247,252,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  meterSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meterLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.textLightSoft,
  },
  meterTrack: {
    width: METER_W,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(234,247,252,0.14)',
    overflow: 'hidden',
  },
  meterFillWrap: { height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dropSlot: { flex: 1 },
  freezePress: { width: 108, height: 60 },
  freezeBtn: {
    width: 108,
    height: 60,
    borderRadius: THEME.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  freezeOn: {
    backgroundColor: 'rgba(110,91,216,0.22)',
    borderColor: THEME.colors.violet,
  },
  freezeOff: {
    backgroundColor: 'rgba(110,91,216,0.10)',
    borderColor: 'rgba(110,91,216,0.35)',
    opacity: 0.42,
  },
  freezePlate: {
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
  freezeText: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.textLight,
  },
});

export default ControlBar;
