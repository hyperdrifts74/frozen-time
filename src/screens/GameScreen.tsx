import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import ControlBar from '../components/ControlBar';
import HintPill from '../components/HintPill';
import IceBoard from '../components/IceBoard';
import QuotaStrip from '../components/QuotaStrip';
import ScreenHeader from '../components/ScreenHeader';
import {
  CONTROL_BAR_BOTTOM,
  CONTROL_BAR_H,
  MISS_LIMIT,
} from '../constants/config';
import { THEME } from '../constants/theme';
import { SweepSetting, sweepStepMs } from '../game/hook';
import { AssistSetting } from '../game/progressStore';
import { streakMultiplier } from '../game/scoring';
import { SceneResult, useScene } from '../hooks/useScene';
import { formatClock, formatNum } from '../utils/format';

interface Props {
  spotIndex: number;
  attempt: number;
  sweep: SweepSetting;
  assist: AssistSetting;
  onGameOver: (result: SceneResult) => void;
  onMenu: () => void;
}

const PIPS = [0, 1, 2];
const HINT_TEXT = 'TAP A LANE TO MOVE · DROP ON THE RIPPLE PEAK';

/** G2 Floating Controls: header -> ice-hole board (flex:1) -> floating bar. */
export function GameScreen({
  spotIndex,
  attempt,
  sweep,
  assist,
  onGameOver,
  onMenu,
}: Props) {
  const {
    scene,
    spot,
    view,
    poppers,
    flash,
    shakeNonce,
    hintVisible,
    moveHook,
    drop,
    triggerFreeze,
    abandon,
  } = useScene({ spotIndex, attempt, sweep, assist, onGameOver });

  const pulse = useRef(new Animated.Value(1)).current;
  const lowTime = view.timeLeftMs <= 10000;

  useEffect(() => {
    if (!lowTime) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [lowTime, pulse]);

  const handleMenu = useCallback(() => {
    abandon();
    onMenu();
  }, [abandon, onMenu]);

  const stepMs = sweepStepMs(spot.sweepMs, sweep, view.frozen);
  const timerColor = view.frozen
    ? THEME.colors.violet
    : lowTime
    ? THEME.colors.warn
    : THEME.colors.textLight;

  return (
    <AuroraBackground variant="game" blobs="mid">
      <ScreenHeader
        variant="dark"
        onBack={handleMenu}
        backLabel="MENU"
        backIcon={ASSETS.iconPause}
        centerSlot={
          <Animated.View
            pointerEvents="none"
            style={[styles.timerWrap, { opacity: pulse }]}>
            <Clock size={16} color={timerColor} strokeWidth={2.2} />
            <Text style={[styles.timer, { color: timerColor }]}>
              {formatClock(view.timeLeftMs)}
            </Text>
          </Animated.View>
        }
        rightSlot={
          <View style={styles.scoreWrap}>
            <Text style={styles.score}>{formatNum(view.score)}</Text>
            <View style={styles.pips}>
              {PIPS.map(i => (
                <View
                  key={'pip' + i}
                  style={[
                    styles.pip,
                    i < view.misses ? styles.pipFilled : styles.pipEmpty,
                  ]}
                />
              ))}
            </View>
          </View>
        }
      />

      <QuotaStrip targets={scene.targets} caught={view.caughtTargets} />

      <View style={styles.area}>
        <IceBoard
          ripples={view.ripples}
          poppers={poppers}
          flash={flash}
          hookLane={view.hookLane}
          stepMs={stepMs}
          frozen={view.frozen}
          assist={assist === 'ON'}
          shakeNonce={shakeNonce}
          onLanePress={moveHook}>
          <HintPill text={HINT_TEXT} visible={hintVisible} />
        </IceBoard>
      </View>

      <ControlBar
        onDrop={drop}
        onFreeze={triggerFreeze}
        freezePct={view.freezePct}
        streakMult={streakMultiplier(view.streak)}
        frozen={view.frozen}
      />

      <View pointerEvents="none" style={styles.footNote}>
        <Text style={styles.footNoteText}>
          {spot.name.toUpperCase() + ' · ' + MISS_LIMIT + ' EMPTY CASTS END THE SCENE'}
        </Text>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  timerWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timer: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreWrap: { alignItems: 'flex-end' },
  score: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: THEME.colors.mint,
    fontVariant: ['tabular-nums'],
  },
  pips: { flexDirection: 'row', gap: 5, marginTop: 4 },
  pip: { width: 7, height: 7, borderRadius: 4 },
  pipFilled: { backgroundColor: THEME.colors.warn },
  pipEmpty: { backgroundColor: 'rgba(234,247,252,0.25)' },
  area: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: CONTROL_BAR_H + CONTROL_BAR_BOTTOM + 10,
  },
  footNote: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 4,
    alignItems: 'center',
  },
  footNoteText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textLightSoft,
  },
});

export default GameScreen;
