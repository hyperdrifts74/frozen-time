import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface Props {
  text: string;
  tone?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}

/** A themed line instead of a blank area — never an empty container. */
export function EmptyNote({ text, tone = 'light', style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text
        style={[
          styles.text,
          {
            color:
              tone === 'dark'
                ? THEME.colors.textLightSoft
                : THEME.colors.textDarkSoft,
          },
        ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default EmptyNote;
