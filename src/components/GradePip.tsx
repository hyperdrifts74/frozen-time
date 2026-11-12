import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

interface Props {
  letter: string;
  filled: boolean;
  color: string;
}

/** S / P / T grade pip — 26x26, filled in the tier colour once earned. */
export function GradePip({ letter, filled, color }: Props) {
  return (
    <View
      style={[
        styles.pip,
        filled
          ? { backgroundColor: color, borderColor: color }
          : styles.pipEmpty,
      ]}>
      <Text
        style={[
          styles.letter,
          { color: filled ? THEME.colors.white : THEME.colors.iceLocked },
        ]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipEmpty: {
    backgroundColor: 'rgba(0,85,139,0.12)',
    borderColor: 'rgba(0,85,139,0.18)',
  },
  letter: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
});

export default GradePip;
