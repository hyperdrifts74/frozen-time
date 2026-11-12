import { Dimensions } from 'react-native';

/** Loader holds exactly 8000 ms — timer driven, never tappable. */
export const LOADER_DURATION_MS = 8000;

/** One fishing scene. */
export const SCENE_MS = 60000;
export const MISS_LIMIT = 3;
export const TICK_MS = 80;

/** Ripple lifecycle: bloom 600 / peak 500 / fade 700 = 1800 ms. */
export const RIPPLE_MS = 1800;
export const PEAK_START_MS = 600;
export const PEAK_END_MS = 1100;

/** Hook sweep. */
export const LANES = 5;
export const HOOK_PAUSE_MS = 1200;
export const HOOK_RAIL_H = 56;
export const SWEEP_MULTIPLIER = {
  CALM: 1.35,
  STANDARD: 1.0,
  BRISK: 0.75,
} as const;

/** Time freeze. */
export const FREEZE_MS = 5000;
export const FREEZE_SWEEP_FACTOR = 2.5; // sweep runs at 40 % speed
export const FREEZE_GAIN = { SMALL: 0.1, PRIME: 0.2, TROPHY: 0.35 } as const;
export const FREEZE_MISS_DRAIN = 0.2;

/** Scoring. */
export const QUOTA_BONUS = 500;
export const ASSIST_OFF_BONUS = 1.1;
export const QUOTA_SIZE = 3;

/** Input guard — two taps closer than this resolve as one drop. */
export const DROP_LOCK_MS = 180;

/** Control hint over the board (rule 9.1). */
export const HINT_MS = 6000;

/** Geometry — rules #4 / #5. */
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const BOARD_PAD = 8;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 10
export const LANE_W = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / LANES);
export const BOARD_W = LANE_W * LANES + 2 * BOARD_FRAME;

/** Floating control bar reserves this much room at the board bottom. */
export const CONTROL_BAR_H = 96;
export const CONTROL_BAR_BOTTOM = 24;
export const BOARD_BOTTOM_RESERVE = 132;

export const HEADER_TOP = 44;
export const HEADER_ROW_H = 48;
export const SPOT_CARD_H = 78;

export type SpotConfig = {
  index: number;
  name: string;
  unlockAt: number; // total catches
  sweepMs: number;
  spawnGapMs: number;
  decoyPct: number;
  pool: number[];
  target: number;
};

/** Six ice spots — quantities only; placement comes from the generator. */
export const SPOTS: SpotConfig[] = [
  {
    index: 0,
    name: 'Shallow Reed',
    unlockAt: 0,
    sweepMs: 2600,
    spawnGapMs: 2200,
    decoyPct: 15,
    pool: [1, 2],
    target: 400,
  },
  {
    index: 1,
    name: 'Glass Bay',
    unlockAt: 8,
    sweepMs: 2300,
    spawnGapMs: 2000,
    decoyPct: 22,
    pool: [1, 2, 3],
    target: 900,
  },
  {
    index: 2,
    name: 'Deep Crack',
    unlockAt: 20,
    sweepMs: 2050,
    spawnGapMs: 1850,
    decoyPct: 30,
    pool: [1, 2, 3, 4],
    target: 1600,
  },
  {
    index: 3,
    name: 'Aurora Shelf',
    unlockAt: 36,
    sweepMs: 1850,
    spawnGapMs: 1700,
    decoyPct: 36,
    pool: [2, 3, 4],
    target: 2600,
  },
  {
    index: 4,
    name: 'Black Current',
    unlockAt: 56,
    sweepMs: 1650,
    spawnGapMs: 1600,
    decoyPct: 42,
    pool: [3, 4, 5],
    target: 4000,
  },
  {
    index: 5,
    name: 'Frozen Heart',
    unlockAt: 80,
    sweepMs: 1500,
    spawnGapMs: 1500,
    decoyPct: 48,
    pool: [3, 4, 5],
    target: 6000,
  },
];

/**
 * Guarantee, not the game: used only if 20 seeded generations in a row fail
 * the solvability check.
 */
export const FALLBACK_SCENE: Array<{
  atMs: number;
  lane: number;
  speciesId: number;
}> = [
  { atMs: 900, lane: 2, speciesId: 1 },
  { atMs: 3100, lane: 0, speciesId: 2 },
  { atMs: 5300, lane: 4, speciesId: 1 },
  { atMs: 7500, lane: 1, speciesId: 0 },
  { atMs: 9700, lane: 3, speciesId: 2 },
  { atMs: 11900, lane: 2, speciesId: 1 },
  { atMs: 14100, lane: 0, speciesId: 1 },
  { atMs: 16300, lane: 4, speciesId: 2 },
  { atMs: 18500, lane: 1, speciesId: 1 },
  { atMs: 20700, lane: 3, speciesId: 0 },
  { atMs: 22900, lane: 2, speciesId: 2 },
  { atMs: 25100, lane: 0, speciesId: 1 },
  { atMs: 27300, lane: 4, speciesId: 1 },
  { atMs: 29500, lane: 1, speciesId: 2 },
  { atMs: 31700, lane: 3, speciesId: 1 },
  { atMs: 33900, lane: 2, speciesId: 0 },
  { atMs: 36100, lane: 0, speciesId: 2 },
  { atMs: 38300, lane: 4, speciesId: 1 },
  { atMs: 40500, lane: 1, speciesId: 1 },
  { atMs: 42700, lane: 3, speciesId: 2 },
  { atMs: 44900, lane: 2, speciesId: 1 },
  { atMs: 47100, lane: 0, speciesId: 0 },
  { atMs: 49300, lane: 4, speciesId: 2 },
  { atMs: 51500, lane: 1, speciesId: 1 },
  { atMs: 53700, lane: 3, speciesId: 1 },
  { atMs: 55900, lane: 2, speciesId: 2 },
];

export const MILESTONES = [
  { id: 'trophy', label: 'FIRST TROPHY' },
  { id: 'row', label: 'FULL ROW IN THE BOOK' },
  { id: 'streak', label: 'STREAK x3' },
  { id: 'spots', label: 'ALL SPOTS OPEN' },
] as const;
