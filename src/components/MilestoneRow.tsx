import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface Props {
  label: string;
  earned: boolean;
  hint: string;
}

export function MilestoneRow({ label, earned, hint }: Props) {
  return (
    <View style={[styles.row, earned ? styles.rowEarned : null]}>
      <CheckCircle2
        size={24}
        strokeWidth={2}
        color={earned ? THEME.colors.mint : THEME.colors.iceLocked}
      />
      <View style={styles.texts}>
        <Text
          numberOfLines={1}
          style={[styles.label, earned ? styles.labelEarned : null]}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.hint}>
          {hint}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.chip,
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1,
    borderColor: THEME.surface.borderInk,
    opacity: 0.72,
  },
  rowEarned: {
    opacity: 1,
    backgroundColor: 'rgba(95,227,192,0.16)',
    borderColor: 'rgba(95,227,192,0.55)',
  },
  texts: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textDarkSoft,
  },
  labelEarned: { color: THEME.colors.accentDeep },
  hint: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textDarkSoft,
  },
});

export default MilestoneRow;
