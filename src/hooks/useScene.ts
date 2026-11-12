import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DROP_LOCK_MS,
  HINT_MS,
  HOOK_PAUSE_MS,
  MISS_LIMIT,
  SCENE_MS,
  TICK_MS,
} from '../constants/config';
import {
  activateFreeze,
  canActivateFreeze,
  chargeFreeze,
  drainFreeze,
} from '../game/freeze';
import {
  clampLane,
  nextSweepLane,
  SweepDir,
  SweepSetting,
  sweepStepMs,
} from '../game/hook';
import { AssistSetting } from '../game/progressStore';
import { Grade, liveEvents, resolveStrike } from '../game/resolve';
import { generateScene, SceneEvent } from '../game/sceneGen';
import {
  computePoints,
  Outcome,
  QUOTA_BONUS,
  resolveOutcome,
  streakMultiplier,
} from '../game/scoring';
import { getSpecies } from '../game/species';
import { getSpot } from '../game/spots';

export interface CatchRecord {
  speciesId: number;
  grade: Grade;
  points: number;
}

export interface Popper {
  key: number;
  lane: number;
  speciesId: number;
  points: number;
  mult: number;
}

export interface LaneFlash {
  key: number;
  lane: number;
  kind: 'catch' | 'miss';
}

export type ScenePhase = 'idle' | 'playing' | 'frozen' | 'over';

export interface SceneResult {
  spotIndex: number;
  attempt: number;
  seed: number;
  score: number;
  baseScore: number;
  quotaBonus: number;
  catches: CatchRecord[];
  bestStreak: number;
  misses: number;
  targets: number[];
  caughtTargets: number[];
  quotaComplete: boolean;
  freezesUsed: number;
  outcome: Outcome;
  usedFallback: boolean;
}

export interface SceneView {
  timeLeftMs: number;
  score: number;
  streak: number;
  misses: number;
  freezePct: number;
  frozen: boolean;
  hookLane: number;
  ripples: SceneEvent[];
  caughtTargets: number[];
  phase: ScenePhase;
}

export interface UseSceneParams {
  spotIndex: number;
  attempt: number;
  sweep: SweepSetting;
  assist: AssistSetting;
  onGameOver: (result: SceneResult) => void;
}

/**
 * Owns the scene clock, the generated event list, ripple lifecycles, misses and
 * the end condition. Every callback reads live data from refs — never from a
 * captured state value — and every timer is torn down on unmount.
 */
export function useScene(params: UseSceneParams) {
  const { spotIndex, attempt, sweep, assist, onGameOver } = params;

  const scene = useMemo(
    () => generateScene(spotIndex, attempt),
    [spotIndex, attempt],
  );
  const spot = useMemo(() => getSpot(spotIndex), [spotIndex]);

  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  const elapsedRef = useRef(0); // scene timer — always advances
  const clockRef = useRef(0); // ripple clock — halts while frozen
  const consumedRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const missesRef = useRef(0);
  const freezeRef = useRef(0);
  const frozenUntilRef = useRef(0);
  const freezeUsesRef = useRef(0);
  const catchesRef = useRef<CatchRecord[]>([]);
  const caughtTargetsRef = useRef<number[]>([]);
  const hookLaneRef = useRef(2);
  const sweepDirRef = useRef<SweepDir>(1);
  const sweepAccRef = useRef(0);
  const sweepPauseUntilRef = useRef(0);
  const endedRef = useRef(false);
  const lastDropRef = useRef(-9999);
  const keyRef = useRef(0);
  const lastTsRef = useRef(0);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const onOverRef = useRef(onGameOver);
  onOverRef.current = onGameOver;
  const assistOffRef = useRef(assist === 'OFF');
  assistOffRef.current = assist === 'OFF';
  const sweepRef = useRef<SweepSetting>(sweep);
  sweepRef.current = sweep;

  const [view, setView] = useState<SceneView>({
    timeLeftMs: SCENE_MS,
    score: 0,
    streak: 0,
    misses: 0,
    freezePct: 0,
    frozen: false,
    hookLane: 2,
    ripples: [],
    caughtTargets: [],
    phase: 'idle',
  });
  const [poppers, setPoppers] = useState<Popper[]>([]);
  const [flash, setFlash] = useState<LaneFlash | null>(null);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
  }, []);

  const publish = useCallback(() => {
    const sc = sceneRef.current;
    const frozen = frozenUntilRef.current > elapsedRef.current;
    let phase: ScenePhase = 'idle';
    if (endedRef.current) {
      phase = 'over';
    } else if (frozen) {
      phase = 'frozen';
    } else if (
      clockRef.current >= 1200 ||
      catchesRef.current.length > 0 ||
      missesRef.current > 0
    ) {
      phase = 'playing';
    }
    setView({
      timeLeftMs: Math.max(0, SCENE_MS - elapsedRef.current),
      score: scoreRef.current,
      streak: streakRef.current,
      misses: missesRef.current,
      freezePct: freezeRef.current,
      frozen,
      hookLane: hookLaneRef.current,
      ripples: liveEvents(sc.events, clockRef.current, consumedRef.current),
      caughtTargets: caughtTargetsRef.current.slice(),
      phase,
    });
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) {
      return;
    }
    endedRef.current = true;
    const sc = sceneRef.current;
    const cfg = getSpot(sc.spotIndex);
    const quotaComplete =
      sc.targets.length > 0 &&
      caughtTargetsRef.current.length >= sc.targets.length;
    const quotaBonus = quotaComplete ? QUOTA_BONUS : 0;
    const baseScore = scoreRef.current;
    const score = baseScore + quotaBonus;
    const outcome = resolveOutcome({
      misses: missesRef.current,
      score,
      target: cfg.target,
      quotaComplete,
    });
    publish();
    onOverRef.current({
      spotIndex: sc.spotIndex,
      attempt: sc.attempt,
      seed: sc.seed,
      score,
      baseScore,
      quotaBonus,
      catches: catchesRef.current.slice(),
      bestStreak: bestStreakRef.current,
      misses: missesRef.current,
      targets: sc.targets.slice(),
      caughtTargets: caughtTargetsRef.current.slice(),
      quotaComplete,
      freezesUsed: freezeUsesRef.current,
      outcome,
      usedFallback: sc.usedFallback,
    });
  }, [publish]);

  // The loop starts with the screen and dies with it.
  useEffect(() => {
    lastTsRef.current = Date.now();
    const id = setInterval(() => {
      if (endedRef.current) {
        return;
      }
      const now = Date.now();
      let dt = now - lastTsRef.current;
      lastTsRef.current = now;
      if (dt < 0) {
        dt = 0;
      }
      if (dt > 400) {
        dt = 400; // app was backgrounded — never jump the scene forward
      }
      elapsedRef.current += dt;

      const frozen = frozenUntilRef.current > elapsedRef.current;
      if (!frozen) {
        clockRef.current += dt;
      }

      if (elapsedRef.current >= sweepPauseUntilRef.current) {
        sweepAccRef.current += dt;
        const step = sweepStepMs(
          getSpot(sceneRef.current.spotIndex).sweepMs,
          sweepRef.current,
          frozen,
        );
        if (step > 0) {
          while (sweepAccRef.current >= step) {
            sweepAccRef.current -= step;
            const nx = nextSweepLane(hookLaneRef.current, sweepDirRef.current);
            hookLaneRef.current = nx.lane;
            sweepDirRef.current = nx.dir;
          }
        }
      }

      if (elapsedRef.current >= SCENE_MS) {
        elapsedRef.current = SCENE_MS;
        finish();
        return;
      }
      publish();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [finish, publish]);

  useEffect(() => {
    setHintVisible(true);
    const id = setTimeout(() => setHintVisible(false), HINT_MS);
    return () => clearTimeout(id);
  }, [spotIndex, attempt]);

  useEffect(() => {
    const timers = timersRef;
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const moveHook = useCallback(
    (lane: number) => {
      if (endedRef.current) {
        return;
      }
      hookLaneRef.current = clampLane(lane);
      sweepPauseUntilRef.current = elapsedRef.current + HOOK_PAUSE_MS;
      sweepAccRef.current = 0;
      publish();
    },
    [publish],
  );

  const drop = useCallback(() => {
    if (endedRef.current) {
      return;
    }
    if (elapsedRef.current - lastDropRef.current < DROP_LOCK_MS) {
      return;
    }
    lastDropRef.current = elapsedRef.current;

    const sc = sceneRef.current;
    const lane = hookLaneRef.current;
    const strike = resolveStrike(
      sc.events,
      lane,
      clockRef.current,
      consumedRef.current,
    );
    const key = ++keyRef.current;

    if (strike.hit && strike.grade) {
      consumedRef.current.add(strike.eventId);
      const sp = getSpecies(strike.speciesId);
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      if (newStreak > bestStreakRef.current) {
        bestStreakRef.current = newStreak;
      }
      const mult = streakMultiplier(newStreak);
      const pts = computePoints(
        sp.base,
        strike.grade,
        newStreak,
        assistOffRef.current,
      );
      scoreRef.current += pts;
      catchesRef.current.push({
        speciesId: sp.id,
        grade: strike.grade,
        points: pts,
      });
      if (
        sc.targets.indexOf(sp.id) >= 0 &&
        caughtTargetsRef.current.indexOf(sp.id) < 0
      ) {
        caughtTargetsRef.current.push(sp.id);
      }
      freezeRef.current = chargeFreeze(freezeRef.current, strike.grade);
      setPoppers(prev =>
        prev.concat([{ key, lane, speciesId: sp.id, points: pts, mult }]),
      );
      later(() => setPoppers(prev => prev.filter(p => p.key !== key)), 900);
      setFlash({ key, lane, kind: 'catch' });
    } else {
      if (strike.eventId >= 0) {
        consumedRef.current.add(strike.eventId);
      }
      missesRef.current += 1;
      streakRef.current = 0;
      freezeRef.current = drainFreeze(freezeRef.current);
      setFlash({ key, lane, kind: 'miss' });
      setShakeNonce(n => n + 1);
    }
    later(
      () => setFlash(prev => (prev && prev.key === key ? null : prev)),
      220,
    );

    publish();
    if (missesRef.current >= MISS_LIMIT) {
      finish();
    }
  }, [finish, later, publish]);

  const triggerFreeze = useCallback(() => {
    if (endedRef.current || !canActivateFreeze(freezeRef.current)) {
      return false;
    }
    const next = activateFreeze(freezeRef.current);
    freezeRef.current = next.meter;
    frozenUntilRef.current = elapsedRef.current + next.untilOffsetMs;
    freezeUsesRef.current += 1;
    publish();
    return true;
  }, [publish]);

  const abandon = useCallback(() => {
    endedRef.current = true;
  }, []);

  return {
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
  };
}
