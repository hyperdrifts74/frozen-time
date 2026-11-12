import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { spriteFor } from '../assets';
import { THEME } from '../constants/theme';
import { BookCell } from '../game/progressStore';
import { Species, tierColor } from '../game/species';
import GradePip from './GradePip';

interface Props {
  species: Species;
  grades: BookCell;
}

/** One book row: the species, its ripple tell, and the three grade pips. */
export function SpeciesRow({ species, grades }: Props) {
  const color = tierColor(species.tier);
  const discovered = grades.SMALL || grades.PRIME || grades.TROPHY;

  return (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: color + '1A' }]}>
        <Image
          source={spriteFor(species.id)}
          style={[styles.sprite, discovered ? null : styles.spriteLocked]}
        />
        {discovered ? null : (
          <View style={styles.lockBadge}>
            <Lock size={14} color={THEME.colors.accentDeep} strokeWidth={2.2} />
          </View>
        )}
      </View>

      <View style={styles.mid}>
        <Text numberOfLines={1} style={styles.name}>
          {species.name}
        </Text>
        <Text numberOfLines={1} style={[styles.tier, { color }]}>
          {species.tier}
        </Text>
        <Text numberOfLines={1} style={styles.tell}>
          {species.tell}
        </Text>
      </View>

      <View style={styles.pips}>
        <GradePip letter="S" filled={grades.SMALL} color={color} />
        <GradePip letter="P" filled={grades.PRIME} color={color} />
        <GradePip letter="T" filled={grades.TROPHY} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: THEME.radius.tile,
    backgroundColor: THEME.surface.light,
    borderWidth: 1,
    borderColor: THEME.surface.borderLight,
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: { width: 56, height: 56, resizeMode: 'contain' },
  spriteLocked: { opacity: 0.3 },
  lockBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(157,206,219,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: THEME.colors.textDark },
  tier: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  tell: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: THEME.colors.textDarkSoft,
  },
  pips: { flexDirection: 'row', gap: 6 },
});

export default SpeciesRow;
