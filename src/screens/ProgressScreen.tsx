import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import EmptyNote from '../components/EmptyNote';
import MilestoneRow from '../components/MilestoneRow';
import ScreenHeader from '../components/ScreenHeader';
import StatCard from '../components/StatCard';
import { SPOTS } from '../constants/config';
import { THEME } from '../constants/theme';
import { ProgressData, hasFullRow } from '../game/progressStore';
import { isSpotUnlocked, unlockedCount } from '../game/spots';
import { formatNum } from '../utils/format';

interface Props {
  data: ProgressData;
  onBack: () => void;
}

const LADDER_COLORS = [
  THEME.colors.accent,
  THEME.colors.accent,
  THEME.colors.accentDeep,
  THEME.colors.accentDeep,
  THEME.colors.violet,
  THEME.colors.violet,
];

function dash(n: number): string {
  return n > 0 ? formatNum(n) : '—';
}

export function ProgressScreen({ data, onBack }: Props) {
  const open = unlockedCount(data.totalCatches);
  const fresh = data.totalCatches === 0 && data.bestScore === 0;

  const milestones = [
    {
      label: 'FIRST TROPHY',
      earned: data.trophies > 0,
      hint: 'STRIKE A RIPPLE AT ITS PEAK',
    },
    {
      label: 'FULL ROW IN THE BOOK',
      earned: hasFullRow(data),
      hint: 'ALL THREE GRADES OF ONE SPECIES',
    },
    {
      label: 'STREAK x3',
      earned: data.bestStreak >= 4,
      hint: 'FOUR CLEAN CASTS IN A ROW',
    },
    {
      label: 'ALL SPOTS OPEN',
      earned: open >= SPOTS.length,
      hint: formatNum(SPOTS[SPOTS.length - 1].unlockAt) + ' TOTAL CATCHES',
    },
  ];

  return (
    <AuroraBackground variant="light" blobs="mid">
      <ScreenHeader
        variant="light"
        title="PROGRESS"
        onBack={onBack}
        backLabel="MENU"
        backIcon={ASSETS.iconHome}
        rightSlot={
          <Text style={styles.count}>{formatNum(data.totalCatches)}</Text>
        }
      />

      <View style={styles.body}>
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.slot}>
              <StatCard
                tone="light"
                value={dash(data.totalCatches)}
                label="TOTAL CATCHES"
                valueColor={THEME.colors.accent}
              />
            </View>
            <View style={styles.slot}>
              <StatCard
                tone="light"
                value={dash(data.bestScore)}
                label="BEST SCORE"
                valueColor={THEME.colors.accentDeep}
              />
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.slot}>
              <StatCard
                tone="light"
                value={dash(data.bestStreak)}
                label="BEST STREAK"
                valueColor={THEME.colors.mint}
              />
            </View>
            <View style={styles.slot}>
              <StatCard
                tone="light"
                value={dash(data.freezesUsed)}
                label="FREEZES USED"
                valueColor={THEME.colors.violet}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SPOT LADDER</Text>
        <View style={styles.ladder}>
          {SPOTS.map(spot => {
            const best = data.bestPerSpot[spot.index] || 0;
            const unlocked = isSpotUnlocked(spot.index, data.totalCatches);
            const pct = Math.min(1, best / spot.target);
            const fillWidth = (Math.round(pct * 100) + '%') as `${number}%`;
            return (
              <View key={spot.name} style={styles.ladderRow}>
                <View style={styles.ladderTop}>
                  <Text numberOfLines={1} style={styles.ladderName}>
                    {spot.name}
                  </Text>
                  <Text style={styles.ladderBest}>
                    {unlocked ? dash(best) : 'LOCKED'}
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: fillWidth,
                        backgroundColor: LADDER_COLORS[spot.index],
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>MILESTONES</Text>
        <View style={styles.milestones}>
          {milestones.map(m => (
            <MilestoneRow
              key={m.label}
              label={m.label}
              earned={m.earned}
              hint={m.hint}
            />
          ))}
        </View>

        {fresh ? (
          <EmptyNote text="NOTHING LOGGED YET — DROP YOUR FIRST LINE" />
        ) : null}
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
  grid: { gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: THEME.colors.accentDeep,
  },
  ladder: { gap: 8 },
  ladderRow: { gap: 4 },
  ladderTop: { flexDirection: 'row', alignItems: 'center' },
  ladderName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  ladderBest: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textDarkSoft,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,85,139,0.14)',
    overflow: 'hidden',
  },
  fill: { height: 4, borderRadius: 2 },
  milestones: { gap: 8 },
});

export default ProgressScreen;
