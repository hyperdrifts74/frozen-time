import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { spriteFor } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import EmptyNote from '../components/EmptyNote';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StatRow from '../components/StatRow';
import { SPOTS } from '../constants/config';
import { THEME } from '../constants/theme';
import { OUTCOME_NOTE, OUTCOME_TEXT } from '../game/scoring';
import { getSpecies, tierColor } from '../game/species';
import { getSpot } from '../game/spots';
import { useCountUp } from '../hooks/useCountUp';
import { SceneResult } from '../hooks/useScene';
import { formatNum } from '../utils/format';

export interface ResultPayload extends SceneResult {
  newGrades: number;
  unlockedSpot: number | null;
}

interface Props {
  result: ResultPayload;
  onAgain: () => void;
  onMenu: () => void;
  onCollection: () => void;
}

const GRADE_COLOR = {
  SMALL: THEME.colors.iceLocked,
  PRIME: THEME.colors.accent,
  TROPHY: THEME.colors.mint,
} as const;

const HEADLINE_COLOR = {
  WIN: THEME.colors.mint,
  PARTIAL: THEME.colors.accent,
  LOSS: THEME.colors.warn,
} as const;

export function ResultScreen({ result, onAgain, onMenu, onCollection }: Props) {
  const headScale = useRef(new Animated.Value(0.9)).current;
  const bodyRise = useRef(new Animated.Value(12)).current;
  const bodyFade = useRef(new Animated.Value(0)).current;
  const bandFade = useRef(new Animated.Value(0)).current;
  const shown = useCountUp(result.score, 650);

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.spring(headScale, {
        toValue: 1,
        tension: 46,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(bandFade, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(bodyFade, {
        toValue: 1,
        duration: 320,
        delay: 70,
        useNativeDriver: true,
      }),
      Animated.timing(bodyRise, {
        toValue: 0,
        duration: 320,
        delay: 70,
        useNativeDriver: true,
      }),
    ]);
    entry.start();
    return () => {
      entry.stop();
    };
  }, [headScale, bandFade, bodyFade, bodyRise]);

  const spot = getSpot(result.spotIndex);
  const win = result.outcome === 'WIN';
  const headColor = HEADLINE_COLOR[result.outcome];
  const list = result.catches.slice().sort((a, b) => b.points - a.points);
  const top = list.slice(0, 5);
  const rest = list.length - top.length;

  return (
    <AuroraBackground variant="result" blobs="top">
      <Animated.View
        pointerEvents="none"
        style={[styles.band, { opacity: bandFade }]}>
        <LinearGradient
          colors={
            win
              ? ['rgba(95,227,192,0.22)', 'rgba(95,227,192,0)']
              : ['rgba(110,91,216,0.20)', 'rgba(110,91,216,0)']
          }
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <ScreenHeader
        variant="dark"
        title={spot.name.toUpperCase()}
        rightSlot={
          <Text style={styles.spotTag}>
            {'SPOT ' + (result.spotIndex + 1) + '/' + SPOTS.length}
          </Text>
        }
      />

      <View style={styles.body}>
        <View style={styles.headBlock}>
          <View style={[styles.arc, { borderTopColor: headColor }]} />
          <Animated.Text
            style={[
              styles.headline,
              { color: headColor, transform: [{ scale: headScale }] },
            ]}>
            {OUTCOME_TEXT[result.outcome]}
          </Animated.Text>
          <Text style={styles.headNote}>{OUTCOME_NOTE[result.outcome]}</Text>
        </View>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.content,
            { opacity: bodyFade, transform: [{ translateY: bodyRise }] },
          ]}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreValue}>{formatNum(shown)}</Text>
            <Text style={styles.scoreLabel}>
              {result.quotaBonus > 0
                ? 'POINTS · CARD BONUS +' + formatNum(result.quotaBonus)
                : 'POINTS'}
            </Text>
          </View>

          {top.length > 0 ? (
            <View style={styles.list}>
              {top.map((c, i) => {
                const sp = getSpecies(c.speciesId);
                return (
                  <View key={'c' + i} style={styles.row}>
                    <Image source={spriteFor(sp.id)} style={styles.sprite} />
                    <Text numberOfLines={1} style={styles.rowName}>
                      {sp.name}
                    </Text>
                    <View
                      style={[
                        styles.gradeBadge,
                        { borderColor: GRADE_COLOR[c.grade] },
                      ]}>
                      <Text
                        style={[
                          styles.gradeText,
                          { color: GRADE_COLOR[c.grade] },
                        ]}>
                        {c.grade}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.rowPoints,
                        { color: tierColor(sp.tier) },
                      ]}>
                      {formatNum(c.points)}
                    </Text>
                  </View>
                );
              })}
              {rest > 0 ? (
                <Text style={styles.more}>{'+ ' + rest + ' MORE ON THE LINE'}</Text>
              ) : null}
            </View>
          ) : (
            <EmptyNote
              tone="dark"
              text="NO FISH SURFACED — READ THE RINGS, NOT THE WATER"
            />
          )}

          <StatRow
            tone="dark"
            style={styles.stats}
            cards={[
              {
                key: 'score',
                value: formatNum(result.score),
                label: 'SCORE',
                color: THEME.colors.mint,
              },
              {
                key: 'streak',
                value: result.bestStreak,
                label: 'BEST STREAK',
                color: THEME.colors.accent,
              },
              {
                key: 'grades',
                value: result.newGrades,
                label: 'NEW GRADES',
                color: THEME.colors.violet,
              },
            ]}
          />

          {result.unlockedSpot !== null ? (
            <View style={styles.unlock}>
              <Text style={styles.unlockText}>
                {'NEW SPOT: ' + getSpot(result.unlockedSpot).name.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.ctas}>
          <PrimaryButton label="CAST AGAIN" onPress={onAgain} height={60} />
          <View style={styles.ctaRow}>
            <View style={styles.ctaSlot}>
              <SecondaryButton label="COLLECTION" onPress={onCollection} />
            </View>
            <View style={styles.ctaSlot}>
              <SecondaryButton label="MENU" onPress={onMenu} />
            </View>
          </View>
        </View>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  spotTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textLightSoft,
  },
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 18 },
  headBlock: { alignItems: 'center' },
  // The frost arc sits ABOVE the headline bounding box — never across letters.
  arc: {
    width: 150,
    height: 16,
    borderTopWidth: 2,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    marginBottom: 12,
    opacity: 0.8,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
  },
  headNote: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    color: THEME.colors.textLightSoft,
  },
  content: { flex: 1, marginTop: 18 },
  scoreBlock: { alignItems: 'center', marginBottom: 14 },
  scoreValue: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.textLight,
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.textLightSoft,
  },
  list: { gap: 8 },
  row: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.chip,
    backgroundColor: 'rgba(234,247,252,0.07)',
    borderWidth: 1,
    borderColor: THEME.surface.borderDark,
  },
  sprite: { width: 34, height: 34, resizeMode: 'contain' },
  rowName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textLight,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: { fontSize: 10, lineHeight: 14, fontWeight: '800', letterSpacing: 1 },
  rowPoints: {
    width: 62,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  more: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: THEME.colors.textLightSoft,
  },
  stats: { marginTop: 14 },
  unlock: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: THEME.radius.chip,
    alignItems: 'center',
    backgroundColor: 'rgba(110,91,216,0.22)',
    borderWidth: 1,
    borderColor: THEME.colors.violet,
  },
  unlockText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.textLight,
  },
  ctas: { gap: 10 },
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaSlot: { flex: 1 },
});

export default ResultScreen;
