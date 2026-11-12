import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

interface Props {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Settings segmented row — every chip changes real game behaviour. */
export function SegmentedChips({ options, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityLabel={opt}
            accessibilityState={{ selected: active }}
            hitSlop={HIT}
            onPress={() => onChange(opt)}
            style={styles.slot}>
            <View style={[styles.chip, active ? styles.chipActive : null]}>
              <Text style={[styles.text, active ? styles.textActive : null]}>
                {opt}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1, height: 44 },
  chip: {
    width: '100%',
    height: 44,
    borderRadius: THEME.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.surface.borderInk,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  chipActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(0,166,203,0.16)',
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.textDarkSoft,
  },
  textActive: { color: THEME.colors.accentDeep },
});

export default SegmentedChips;
