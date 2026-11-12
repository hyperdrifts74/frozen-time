import {
  FALLBACK_SCENE,
  LANES,
  QUOTA_SIZE,
  RIPPLE_MS,
  SCENE_MS,
} from '../constants/config';
import { makeSeed, mulberry32, pickWeighted, Rng } from './rng';
import { getSpecies, speciesWeight } from './species';
import { getSpot } from './spots';

export interface SceneEvent {
  id: number;
  atMs: number;
  lane: number;
  /** 0 = decoy (empty water), 1..5 = species id. */
  speciesId: number;
  decoy: boolean;
  rings: number;
}

export interface Scene {
  seed: number;
  spotIndex: number;
  attempt: number;
  events: SceneEvent[];
  targets: number[];
  usedFallback: boolean;
  tries: number;
}

export const MIN_REAL_FISH = 6;
export const MAX_DECOY_RUN = 3;
export const MIN_SAME_LANE_GAP_MS = 500;

/** Up to 20 regenerations, then the fallback. The fallback is a guarantee, not the game. */
export const MAX_GEN_TRIES = 20;

function buildEvents(rnd: Rng, spotIndex: number): SceneEvent[] {
  const spot = getSpot(spotIndex);
  const pool = spot.pool;
  const weights = pool.map(speciesWeight);
  const slots = Math.floor(SCENE_MS / spot.spawnGapMs);
  const events: SceneEvent[] = [];

  for (let i = 0; i < slots; i++) {
    const jitter = Math.round((rnd() * 2 - 1) * 140);
    const atMs = 700 + i * spot.spawnGapMs + jitter;
    if (atMs < 300 || atMs + RIPPLE_MS > SCENE_MS) {
      continue;
    }
    const lane = Math.floor(rnd() * LANES) % LANES;
    const isDecoy = rnd() * 100 < spot.decoyPct;
    const speciesId = isDecoy ? 0 : pickWeighted(rnd, pool, weights);
    events.push({
      id: i,
      atMs,
      lane,
      speciesId,
      decoy: isDecoy,
      rings: isDecoy ? 2 : getSpecies(speciesId).rings,
    });
  }
  return events;
}

/** A generated layout is verified playable before it is shown. */
export function validateScene(events: SceneEvent[]): boolean {
  let realFish = 0;
  let decoyRun = 0;
  for (let i = 0; i < events.length; i++) {
    if (events[i].decoy) {
      decoyRun++;
      if (decoyRun > MAX_DECOY_RUN) {
        return false;
      }
    } else {
      decoyRun = 0;
      realFish++;
    }
  }
  if (realFish < MIN_REAL_FISH) {
    return false;
  }
  const lastInLane: number[] = new Array(LANES).fill(-Infinity);
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.atMs - lastInLane[e.lane] < MIN_SAME_LANE_GAP_MS) {
      return false;
    }
    lastInLane[e.lane] = e.atMs;
  }
  return true;
}

/** Up to QUOTA_SIZE distinct species from the spot pool — the scene catch card. */
export function pickTargets(rnd: Rng, pool: number[]): number[] {
  const bag = pool.slice();
  const out: number[] = [];
  const want = Math.min(QUOTA_SIZE, bag.length);
  while (out.length < want && bag.length > 0) {
    const i = Math.floor(rnd() * bag.length) % bag.length;
    out.push(bag[i]);
    bag.splice(i, 1);
  }
  out.sort((a, b) => a - b);
  return out;
}

/** The fallback reuses the spot's own pool so its catch card stays completable. */
function fallbackEvents(pool: number[]): SceneEvent[] {
  let cursor = 0;
  return FALLBACK_SCENE.map((e, i) => {
    if (e.speciesId === 0) {
      return { id: i, atMs: e.atMs, lane: e.lane, speciesId: 0, decoy: true, rings: 2 };
    }
    const speciesId = pool[cursor % pool.length];
    cursor++;
    return {
      id: i,
      atMs: e.atMs,
      lane: e.lane,
      speciesId,
      decoy: false,
      rings: getSpecies(speciesId).rings,
    };
  });
}

export function generateScene(spotIndex: number, attempt: number): Scene {
  const spot = getSpot(spotIndex);
  const seed = makeSeed(spotIndex, attempt);

  for (let t = 0; t < MAX_GEN_TRIES; t++) {
    const rnd = mulberry32((seed + t * 7919) >>> 0);
    const events = buildEvents(rnd, spotIndex);
    if (validateScene(events)) {
      return {
        seed,
        spotIndex,
        attempt,
        events,
        targets: pickTargets(rnd, spot.pool),
        usedFallback: false,
        tries: t + 1,
      };
    }
  }

  const rnd = mulberry32(seed);
  return {
    seed,
    spotIndex,
    attempt,
    events: fallbackEvents(spot.pool),
    targets: pickTargets(rnd, spot.pool),
    usedFallback: true,
    tries: MAX_GEN_TRIES,
  };
}
