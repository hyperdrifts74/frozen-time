import { SPOTS } from '../constants/config';
import { Grade } from './resolve';
import { SPECIES } from './species';
import { SweepSetting } from './hook';

export type AssistSetting = 'ON' | 'OFF';

export interface BookCell {
  SMALL: boolean;
  PRIME: boolean;
  TROPHY: boolean;
}

export interface ProgressData {
  totalCatches: number;
  bestScore: number;
  bestStreak: number;
  freezesUsed: number;
  trophies: number;
  bestPerSpot: number[];
  book: Record<string, BookCell>;
  lastSpot: number;
  sweep: SweepSetting;
  assist: AssistSetting;
}

export interface SceneOutcomeInput {
  spotIndex: number;
  score: number;
  bestStreak: number;
  freezesUsed: number;
  catches: Array<{ speciesId: number; grade: Grade }>;
}

export interface MergeExtras {
  unlockedSpot: number | null;
  newGrades: number;
}

function emptyBook(): Record<string, BookCell> {
  const book: Record<string, BookCell> = {};
  for (let i = 0; i < SPECIES.length; i++) {
    book[String(SPECIES[i].id)] = { SMALL: false, PRIME: false, TROPHY: false };
  }
  return book;
}

export function createFresh(): ProgressData {
  return {
    totalCatches: 0,
    bestScore: 0,
    bestStreak: 0,
    freezesUsed: 0,
    trophies: 0,
    bestPerSpot: SPOTS.map(() => 0),
    book: emptyBook(),
    lastSpot: 0,
    sweep: 'STANDARD',
    assist: 'ON',
  };
}

export function cloneData(data: ProgressData): ProgressData {
  const book: Record<string, BookCell> = {};
  const keys = Object.keys(data.book);
  for (let i = 0; i < keys.length; i++) {
    const cell = data.book[keys[i]];
    book[keys[i]] = { SMALL: cell.SMALL, PRIME: cell.PRIME, TROPHY: cell.TROPHY };
  }
  return { ...data, bestPerSpot: data.bestPerSpot.slice(), book };
}

export function filledCells(data: ProgressData): number {
  let n = 0;
  const keys = Object.keys(data.book);
  for (let i = 0; i < keys.length; i++) {
    const cell = data.book[keys[i]];
    if (cell.SMALL) {
      n++;
    }
    if (cell.PRIME) {
      n++;
    }
    if (cell.TROPHY) {
      n++;
    }
  }
  return n;
}

export function discoveredSpecies(data: ProgressData): number {
  let n = 0;
  for (let i = 0; i < SPECIES.length; i++) {
    const cell = data.book[String(SPECIES[i].id)];
    if (cell && (cell.SMALL || cell.PRIME || cell.TROPHY)) {
      n++;
    }
  }
  return n;
}

export function hasFullRow(data: ProgressData): boolean {
  for (let i = 0; i < SPECIES.length; i++) {
    const cell = data.book[String(SPECIES[i].id)];
    if (cell && cell.SMALL && cell.PRIME && cell.TROPHY) {
      return true;
    }
  }
  return false;
}

/** Pure merge — the single place a scene result changes saved data. */
export function mergeSceneResult(
  data: ProgressData,
  result: SceneOutcomeInput,
): { data: ProgressData; extras: MergeExtras } {
  const next = cloneData(data);
  const unlockedBefore = SPOTS.filter(s => data.totalCatches >= s.unlockAt).length;

  let newGrades = 0;
  for (let i = 0; i < result.catches.length; i++) {
    const c = result.catches[i];
    const key = String(c.speciesId);
    if (!next.book[key]) {
      next.book[key] = { SMALL: false, PRIME: false, TROPHY: false };
    }
    if (!next.book[key][c.grade]) {
      next.book[key][c.grade] = true;
      newGrades++;
    }
    if (c.grade === 'TROPHY') {
      next.trophies++;
    }
  }

  next.totalCatches += result.catches.length;
  next.bestScore = Math.max(next.bestScore, result.score);
  next.bestStreak = Math.max(next.bestStreak, result.bestStreak);
  next.freezesUsed += result.freezesUsed;
  next.lastSpot = result.spotIndex;
  const spotIdx = Math.min(Math.max(result.spotIndex, 0), next.bestPerSpot.length - 1);
  next.bestPerSpot[spotIdx] = Math.max(next.bestPerSpot[spotIdx], result.score);

  const unlockedAfter = SPOTS.filter(s => next.totalCatches >= s.unlockAt).length;
  const unlockedSpot = unlockedAfter > unlockedBefore ? unlockedAfter - 1 : null;

  return { data: next, extras: { unlockedSpot, newGrades } };
}

/**
 * Repository singleton. The RN dependency allow-list carries no storage module,
 * so this is an in-process store behind load/save/reset — the one place a
 * native backend would later be plugged in.
 */
type Listener = (data: ProgressData) => void;

let current: ProgressData = createFresh();
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach(l => l(current));
}

export const progressStore = {
  load(): ProgressData {
    return current;
  },
  save(next: ProgressData): ProgressData {
    current = next;
    emit();
    return current;
  },
  update(fn: (data: ProgressData) => ProgressData): ProgressData {
    current = fn(cloneData(current));
    emit();
    return current;
  },
  applySceneResult(result: SceneOutcomeInput): MergeExtras {
    const merged = mergeSceneResult(current, result);
    current = merged.data;
    emit();
    return merged.extras;
  },
  reset(): ProgressData {
    current = createFresh();
    emit();
    return current;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
