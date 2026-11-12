import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
  tone?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}

/**
 * The ONE stat component. No icons, no sprites — colour carries the semantics,
 * so every pill in a row is geometrically identical. Falsy value renders null:
 * an empty rounded box reads as a broken skeleton.
 */
export function StatCard({
  value,
  label,
  valueColor = THEME.colors.accent,
  tone = 'dark',
  style,
}: StatCardProps) {
  if (!value && value !== 0) {
    return null;
  }
  if (value === 0 || value === '0' || value === '') {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        tone === 'dark' ? styles.dark : styles.light,
        { borderColor: valueColor + '55' },
        style,
      ]}>
      <View style={[styles.dot, { backgroundColor: valueColor }]} />
      <Text
        numberOfLines={1}
        style={[styles.value, { color: valueColor }]}>
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color:
              tone === 'dark'
                ? THEME.colors.textLightSoft
                : THEME.colors.textDarkSoft,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // width:'100%' (never flex:1) — the parent slot owns the width, the card
  // takes its intrinsic content height. flex:1 inside flex:1 collapses it.
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.tile,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dark: { backgroundColor: 'rgba(234,247,252,0.08)' },
  light: { backgroundColor: THEME.surface.light },
  dot: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});

export default StatCard;
