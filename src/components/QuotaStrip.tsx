import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { spriteFor } from '../assets';
import { THEME } from '../constants/theme';
import { getSpecies } from '../game/species';

interface Props {
  targets: number[];
  caught: number[];
}

/** The scene catch card: which species this hole is scored on. */
export function QuotaStrip({ targets, caught }: Props) {
  if (targets.length < 2) {
    return null;
  }
  return (
    <View style={styles.strip}>
      <Text style={styles.title}>CATCH CARD</Text>
      <View style={styles.chips}>
        {targets.map(id => {
          const done = caught.indexOf(id) >= 0;
          return (
            <View
              key={'q' + id}
              style={[styles.chip, done ? styles.chipDone : null]}>
              <Image source={spriteFor(id)} style={styles.sprite} />
              <Text
                numberOfLines={1}
                style={[styles.name, done ? styles.nameDone : null]}>
                {done
                  ? getSpecies(id).name.toUpperCase() + ' ✓'
                  : getSpecies(id).name.toUpperCase()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: THEME.surface.darkFaint,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.textLightSoft,
  },
  chips: { flex: 1, flexDirection: 'row', gap: 6 },
  chip: {
    flex: 1,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234,247,252,0.16)',
    backgroundColor: 'rgba(234,247,252,0.06)',
  },
  chipDone: {
    borderColor: THEME.colors.mint,
    backgroundColor: 'rgba(95,227,192,0.14)',
  },
  sprite: { width: 16, height: 16, resizeMode: 'contain' },
  name: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '700',
    color: THEME.colors.textLightSoft,
  },
  nameDone: { color: THEME.colors.mint },
});

export default QuotaStrip;
