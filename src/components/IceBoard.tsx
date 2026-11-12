import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Polygon } from 'react-native-svg';
import { ASSETS } from '../assets';
import {
  BOARD_BORDER,
  BOARD_PAD,
  BOARD_W,
  HOOK_RAIL_H,
  LANE_W,
  LANES,
} from '../constants/config';
import { THEME } from '../constants/theme';
import { SceneEvent } from '../game/sceneGen';
import { tierColor, getSpecies } from '../game/species';
import { LaneFlash, Popper } from '../hooks/useScene';
import CatchPopper from './CatchPopper';
import HookRail from './HookRail';
import Ripple from './Ripple';

interface Props {
  ripples: SceneEvent[];
  poppers: Popper[];
  flash: LaneFlash | null;
  hookLane: number;
  stepMs: number;
  frozen: boolean;
  assist: boolean;
  shakeNonce: number;
  onLanePress: (lane: number) => void;
  children?: React.ReactNode;
}

const LANE_INDEXES = [0, 1, 2, 3, 4];
const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const SHARDS = [
  '0,0 26,6 10,22',
  '0,22 20,0 24,20',
  '2,4 24,0 14,24',
  '0,10 22,2 18,24',
  '4,0 24,14 2,22',
  '0,6 26,0 12,24',
];

function FrostShards() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {SHARDS.map((pts, i) => (
        <View
          key={'s' + i}
          pointerEvents="none"
          style={[
            styles.shard,
            {
              top: 40 + (i % 3) * 120,
              left: i < 3 ? 6 : undefined,
              right: i >= 3 ? 6 : undefined,
            },
          ]}>
          <Svg width={26} height={24} viewBox="0 0 26 24">
            <Polygon points={pts} fill="rgba(234,247,252,0.22)" />
          </Svg>
        </View>
      ))}
    </View>
  );
}

/** The five-lane ice hole. Geometry comes from BOARD_FRAME so nothing sticks out. */
export function IceBoard({
  ripples,
  poppers,
  flash,
  hookLane,
  stepMs,
  frozen,
  assist,
  shakeNonce,
  onLanePress,
  children,
}: Props) {
  const freezeFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(freezeFade, {
      toValue: frozen ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [frozen, freezeFade]);

  return (
    <View style={styles.board}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={ASSETS.bgGame}
          style={StyleSheet.absoluteFill}
          imageStyle={styles.bgImage}
          resizeMode="cover">
          <LinearGradient
            colors={[...THEME.gradients.board]}
            style={[StyleSheet.absoluteFill, styles.water]}
          />
        </ImageBackground>
      </View>

      <View style={styles.inner}>
        {/* Lanes — one Pressable per lane, each a full-height column. */}
        <View style={styles.lanes}>
          {LANE_INDEXES.map(i => (
            <Pressable
              key={'lane' + i}
              accessibilityRole="button"
              accessibilityLabel={'LANE ' + (i + 1)}
              hitSlop={HIT}
              onPress={() => onLanePress(i)}
              style={[
                styles.lane,
                i < LANES - 1 ? styles.laneDivider : null,
                hookLane === i ? styles.laneActive : null,
              ]}
            />
          ))}
        </View>

        {/* Ripples, flashes and catch pops — never intercept a lane tap. */}
        <View pointerEvents="none" style={styles.overlay}>
          {LANE_INDEXES.map(i => (
            <View key={'ov' + i} pointerEvents="none" style={styles.overlayLane}>
              {flash && flash.lane === i ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.flash,
                    flash.kind === 'catch' ? styles.flashCatch : styles.flashMiss,
                  ]}
                />
              ) : null}
              {ripples
                .filter(e => e.lane === i)
                .map(e => (
                  <View
                    key={'rp' + e.id}
                    pointerEvents="none"
                    style={styles.centered}>
                    <Ripple
                      color={
                        e.decoy
                          ? THEME.colors.iceLocked
                          : tierColor(getSpecies(e.speciesId).tier)
                      }
                      rings={e.rings}
                      decoy={e.decoy}
                      frozen={frozen}
                      assist={assist}
                    />
                  </View>
                ))}
              {poppers
                .filter(p => p.lane === i)
                .map(p => (
                  <CatchPopper
                    key={'pp' + p.key}
                    speciesId={p.speciesId}
                    points={p.points}
                    mult={p.mult}
                  />
                ))}
            </View>
          ))}
        </View>

        <HookRail
          lane={hookLane}
          stepMs={stepMs}
          frozen={frozen}
          shakeNonce={shakeNonce}
        />

        <Animated.View
          pointerEvents="none"
          style={[styles.freeze, { opacity: freezeFade }]}>
          <FrostShards />
        </Animated.View>

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_W,
    flex: 1,
    alignSelf: 'center',
    padding: BOARD_PAD,
    borderWidth: BOARD_BORDER,
    borderColor: 'rgba(234,247,252,0.14)',
    borderRadius: THEME.radius.card,
    overflow: 'hidden',
  },
  bgImage: { opacity: 0.3 },
  water: { opacity: 0.88 },
  inner: { flex: 1, width: LANE_W * LANES, alignSelf: 'center' },
  lanes: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  lane: { width: LANE_W, height: '100%' },
  laneDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(234,247,252,0.08)',
  },
  laneActive: { backgroundColor: 'rgba(0,166,203,0.08)' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    paddingTop: HOOK_RAIL_H,
    paddingBottom: 22,
  },
  overlayLane: {
    width: LANE_W,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: { ...StyleSheet.absoluteFillObject },
  flashCatch: { backgroundColor: 'rgba(95,227,192,0.22)' },
  flashMiss: { backgroundColor: 'rgba(224,115,79,0.18)' },
  freeze: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(110,91,216,0.16)',
  },
  shard: { position: 'absolute' },
});

export default IceBoard;
