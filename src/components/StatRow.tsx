import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import StatCard from './StatCard';

export interface StatRowItem {
  key: string;
  value: string | number;
  label: string;
  color: string;
}

interface Props {
  cards: StatRowItem[];
  tone?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}

function isVisible(v: string | number): boolean {
  return !(v === 0 || v === '0' || v === '' || v === undefined || v === null);
}

/** A lone pill looks orphaned — render the row only when 2+ cards survive. */
export function StatRow({ cards, tone = 'dark', style }: Props) {
  const visible = cards.filter(c => isVisible(c.value));
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={[styles.row, style]}>
      {visible.map(c => (
        <View key={c.key} style={styles.slot}>
          <StatCard
            value={c.value}
            label={c.label}
            valueColor={c.color}
            tone={tone}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
});

export default StatRow;
