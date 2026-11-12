import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  BarChart3,
  BookOpen,
  Map as MapIcon,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react-native';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import BentoTile from '../components/BentoTile';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import { SCENE_MS, MISS_LIMIT } from '../constants/config';
import { THEME } from '../constants/theme';
import { ProgressData, filledCells } from '../game/progressStore';
import { clampToUnlocked, getSpot, nextUnlock } from '../game/spots';
import { SPECIES } from '../game/species';
import { formatNum } from '../utils/format';

interface Props {
  data: ProgressData;
  onPlay: () => void;
  onLevels: () => void;
  onCollection: () => void;
  onProgress: () => void;
  onSettings: () => void;
}

const ROUTES = [
  { key: 'LEVELS', Icon: MapIcon, accent: THEME.colors.accent },
  { key: 'COLLECTION', Icon: BookOpen, accent: THEME.colors.violet },
  { key: 'PROGRESS', Icon: BarChart3, accent: THEME.colors.mint },
  { key: 'SETTINGS', Icon: SettingsIcon, accent: THEME.colors.accentDeep },
];

const TOTAL_CELLS = SPECIES.length * 3;

/** M3 Bento-Hub: a big PLAY tile plus small tiles that route to everything else. */
export function MenuScreen({
  data,
  onPlay,
  onLevels,
  onCollection,
  onProgress,
  onSettings,
}: Props) {
  const heroRise = useRef(new Animated.Value(14)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const gridScale = useRef(new Animated.Value(0.96)).current;
  const gridFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(heroRise, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(gridFade, {
        toValue: 1,
        duration: 300,
        delay: 60,
        useNativeDriver: true,
      }),
      Animated.spring(gridScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 60,
        useNativeDriver: true,
      }),
    ]);
    entry.start();
    return () => {
      entry.stop();
    };
  }, [heroFade, heroRise, gridFade, gridScale]);

  const spotIndex = clampToUnlocked(data.lastSpot, data.totalCatches);
  const spot = getSpot(spotIndex);
  const filled = filledCells(data);
  const upcoming = nextUnlock(data.totalCatches);

  const handlers: Record<string, () => void> = {
    LEVELS: onLevels,
    COLLECTION: onCollection,
    PROGRESS: onProgress,
    SETTINGS: onSettings,
  };

  return (
    <AuroraBackground variant="light" blobs="top">
      <ScreenHeader
        variant="light"
        leftSlot={
          <View style={styles.brand}>
            <Image source={ASSETS.logo} style={styles.brandLogo} />
            <Text style={styles.brandText}>FROZEN TIME</Text>
          </View>
        }
        rightSlot={
          <View style={styles.badge}>
            <Sparkles
              size={18}
              color={THEME.colors.accentDeep}
              strokeWidth={2.2}
            />
            <Text style={styles.badgeValue}>{formatNum(data.totalCatches)}</Text>
          </View>
        }
      />

      <View style={styles.body}>
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.hero,
            { opacity: heroFade, transform: [{ translateY: heroRise }] },
          ]}>
          <ImageBackground
            source={ASSETS.bgGame}
            style={styles.heroBg}
            imageStyle={styles.heroImg}
            resizeMode="cover">
            <LinearGradient
              colors={[...THEME.gradients.heroOverlay]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroText}>
              <Text style={styles.heroLabel}>CURRENT SPOT</Text>
              <Text numberOfLines={1} style={styles.heroName}>
                {spot.name}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>

        <Text style={styles.hint}>
          TAP A LANE TO MOVE THE HOOK · DROP ON THE RIPPLE PEAK
        </Text>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.grid,
            { opacity: gridFade, transform: [{ scale: gridScale }] },
          ]}>
          <View style={styles.rowA}>
            <BentoTile
              size="lg"
              accent={THEME.colors.accent}
              style={styles.playSlot}>
              <View style={styles.playBody}>
                <Image source={ASSETS.sprite5} style={styles.playSprite} />
                <Text style={styles.playNote}>
                  {Math.round(SCENE_MS / 1000) + 's SCENE · ' + MISS_LIMIT + ' MISSES'}
                </Text>
                <PrimaryButton
                  label="START FISHING"
                  onPress={onPlay}
                  height={60}
                  style={styles.playButton}
                />
              </View>
            </BentoTile>

            <View style={styles.sideCol}>
              <BentoTile size="sm" accent={THEME.colors.accent}>
                <View style={styles.sideBody}>
                  <Text style={styles.sideValue}>
                    {data.bestScore > 0 ? formatNum(data.bestScore) : '—'}
                  </Text>
                  <Text style={styles.sideLabel}>BEST SCORE</Text>
                </View>
              </BentoTile>
              <BentoTile size="sm" accent={THEME.colors.violet}>
                <View style={styles.sideBody}>
                  <Text style={[styles.sideValue, styles.sideValueAlt]}>
                    {filled + '/' + TOTAL_CELLS}
                  </Text>
                  <Text style={styles.sideLabel}>SPECIES GRADES</Text>
                </View>
              </BentoTile>
            </View>
          </View>

          <View style={styles.rowB}>
            {ROUTES.map(r => (
              <BentoTile
                key={r.key}
                size="sm"
                padding={6}
                accent={r.accent}
                label={r.key}
                onPress={handlers[r.key]}>
                <View style={styles.routeBody}>
                  <r.Icon size={24} color={r.accent} strokeWidth={2} />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    style={styles.routeLabel}>
                    {r.key}
                  </Text>
                </View>
              </BentoTile>
            ))}
          </View>
        </Animated.View>

        <Text numberOfLines={1} style={styles.footer}>
          {upcoming
            ? 'NEXT SPOT · ' + upcoming.name.toUpperCase() + ' IN ' + upcoming.need + ' CATCHES'
            : 'ALL SIX SPOTS OPEN · CHASE THE TROPHY GRADES'}
        </Text>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 32, height: 32, resizeMode: 'contain' },
  brandText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.textDark,
  },
  badge: {
    height: 34,
    minWidth: 72,
    paddingHorizontal: 12,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: THEME.surface.borderInk,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.accentDeep,
    fontVariant: ['tabular-nums'],
  },
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
  hero: { height: 140, borderRadius: THEME.radius.card, overflow: 'hidden' },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  heroImg: { borderRadius: THEME.radius.card },
  heroText: { padding: 16 },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: THEME.colors.textLightSoft,
  },
  heroName: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textLight,
  },
  hint: {
    marginTop: 12,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textAlign: 'center',
    color: THEME.colors.textDarkSoft,
  },
  grid: { flex: 1, gap: 12 },
  rowA: { flex: 1, minHeight: 190, flexDirection: 'row', gap: 12 },
  playSlot: { flex: 1.35 },
  playBody: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  playSprite: { width: 64, height: 64, resizeMode: 'contain' },
  playNote: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textDarkSoft,
  },
  playButton: { marginTop: 0 },
  sideCol: { flex: 1, gap: 12 },
  sideBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sideValue: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.accentDeep,
    fontVariant: ['tabular-nums'],
  },
  sideValueAlt: { color: THEME.colors.violet },
  sideLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textDarkSoft,
  },
  rowB: { height: 86, flexDirection: 'row', gap: 12 },
  routeBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: THEME.colors.accentDeep,
  },
  footer: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: THEME.colors.textDarkSoft,
  },
});

export default MenuScreen;
