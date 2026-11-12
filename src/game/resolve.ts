import { PEAK_END_MS, PEAK_START_MS, RIPPLE_MS } from '../constants/config';
import { SceneEvent } from './sceneGen';

export type Grade = 'SMALL' | 'PRIME' | 'TROPHY';
export type MissReason = 'NO_RIPPLE' | 'DECOY';

export interface Strike {
  hit: boolean;
  grade: Grade | null;
  speciesId: number;
  eventId: number;
  reason: MissReason | null;
  phaseMs: number;
}

/**
 * Strike window inside the 1800 ms ripple:
 *   0-600    bloom -> PRIME
 *   600-1100 peak  -> TROPHY
 *   1100-1800 fade -> SMALL
 */
export function gradeForPhase(phaseMs: number): Grade | null {
  if (phaseMs < 0 || phaseMs >= RIPPLE_MS) {
    return null;
  }
  if (phaseMs < PEAK_START_MS) {
    return 'PRIME';
  }
  if (phaseMs < PEAK_END_MS) {
    return 'TROPHY';
  }
  return 'SMALL';
}

/** Every ripple currently alive on the board (used for rendering). */
export function liveEvents(
  events: SceneEvent[],
  clockMs: number,
  consumed: Set<number>,
): SceneEvent[] {
  const out: SceneEvent[] = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (consumed.has(e.id)) {
      continue;
    }
    const phase = clockMs - e.atMs;
    if (phase >= 0 && phase < RIPPLE_MS) {
      out.push(e);
    }
  }
  return out;
}

const MISS: Strike = {
  hit: false,
  grade: null,
  speciesId: 0,
  eventId: -1,
  reason: 'NO_RIPPLE',
  phaseMs: -1,
};

/**
 * Resolve a drop against whatever is alive in that lane right now.
 * No live ripple, a decoy, or an already-faded ripple all count as empty water.
 */
export function resolveStrike(
  events: SceneEvent[],
  lane: number,
  clockMs: number,
  consumed: Set<number>,
): Strike {
  let best: SceneEvent | null = null;
  let bestPhase = -1;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.lane !== lane || consumed.has(e.id)) {
      continue;
    }
    const phase = clockMs - e.atMs;
    if (phase >= 0 && phase < RIPPLE_MS) {
      // Oldest live ripple in the lane wins — it is the one about to fade.
      if (best === null || phase > bestPhase) {
        best = e;
        bestPhase = phase;
      }
    }
  }

  if (best === null) {
    return MISS;
  }
  if (best.decoy) {
    return {
      hit: false,
      grade: null,
      speciesId: 0,
      eventId: best.id,
      reason: 'DECOY',
      phaseMs: bestPhase,
    };
  }
  const grade = gradeForPhase(bestPhase);
  if (grade === null) {
    return MISS;
  }
  return {
    hit: true,
    grade,
    speciesId: best.speciesId,
    eventId: best.id,
    reason: null,
    phaseMs: bestPhase,
  };
}
