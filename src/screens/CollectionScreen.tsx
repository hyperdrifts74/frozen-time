import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import EmptyNote from '../components/EmptyNote';
import ScreenHeader from '../components/ScreenHeader';
import SpeciesRow from '../components/SpeciesRow';
import { THEME } from '../constants/theme';
import {
  ProgressData,
  discoveredSpecies,
  filledCells,
} from '../game/progressStore';
import { DECOY_TELL, SPECIES } from '../game/species';

interface Props {
  data: ProgressData;
  onBack: () => void;
}

const TOTAL_CELLS = SPECIES.length * 3;

/** The book: 5 species x 3 grades. Locked rows keep their tell so it teaches. */
export function CollectionScreen({ data, onBack }: Props) {
  const filled = filledCells(data);
  const found = discoveredSpecies(data);

  return (
    <AuroraBackground
      variant="light"
      blobs="mid"
      wash="rgba(255,255,255,0.35)">
      <ScreenHeader
        variant="light"
        title="COLLECTION"
        onBack={onBack}
        backLabel="MENU"
        backIcon={ASSETS.iconHome}
        rightSlot={
          <Text style={styles.count}>{filled + '/' + TOTAL_CELLS}</Text>
        }
      />

      <View style={styles.body}>
        <View style={styles.legend}>
          <Text style={styles.legendText}>S SMALL · P PRIME · T TROPHY</Text>
        </View>

        <View style={styles.list}>
          {SPECIES.map(sp => (
            <SpeciesRow
              key={sp.name}
              species={sp}
              grades={
                data.book[String(sp.id)] || {
                  SMALL: false,
                  PRIME: false,
                  TROPHY: false,
                }
              }
            />
          ))}
        </View>

        {found === 0 ? (
          <EmptyNote text="PLAY TO UNLOCK — EVERY SPECIES HAS THREE GRADES" />
        ) : (
          <View style={styles.decoy}>
            <Text style={styles.decoyTitle}>EMPTY WATER</Text>
            <Text style={styles.decoyText}>{DECOY_TELL}</Text>
          </View>
        )}
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textDarkSoft,
    fontVariant: ['tabular-nums'],
  },
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
  legend: { alignItems: 'center', marginBottom: 10 },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.textDarkSoft,
  },
  list: { flex: 1, gap: 10, justifyContent: 'space-between' },
  decoy: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: THEME.radius.chip,
    alignItems: 'center',
    backgroundColor: 'rgba(157,206,219,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,139,0.18)',
  },
  decoyTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: THEME.colors.accentDeep,
  },
  decoyText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.textDarkSoft,
  },
});

export default CollectionScreen;
