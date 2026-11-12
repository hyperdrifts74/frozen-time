import { SPOTS, SpotConfig } from '../constants/config';

export { SPOTS };
export type { SpotConfig };

export function getSpot(index: number): SpotConfig {
  const i = Math.min(Math.max(index, 0), SPOTS.length - 1);
  return SPOTS[i];
}

export function isSpotUnlocked(index: number, totalCatches: number): boolean {
  return totalCatches >= getSpot(index).unlockAt;
}

export function unlockedCount(totalCatches: number): number {
  let n = 0;
  for (let i = 0; i < SPOTS.length; i++) {
    if (totalCatches >= SPOTS[i].unlockAt) {
      n++;
    }
  }
  return n;
}

/** Highest unlocked spot index, used when Menu starts the last played spot. */
export function clampToUnlocked(index: number, totalCatches: number): number {
  if (isSpotUnlocked(index, totalCatches)) {
    return Math.min(Math.max(index, 0), SPOTS.length - 1);
  }
  return unlockedCount(totalCatches) - 1;
}

/** Catches still missing before the next locked spot opens, or null. */
export function nextUnlock(
  totalCatches: number,
): { index: number; name: string; need: number } | null {
  for (let i = 0; i < SPOTS.length; i++) {
    if (totalCatches < SPOTS[i].unlockAt) {
      return {
        index: i,
        name: SPOTS[i].name,
        need: SPOTS[i].unlockAt - totalCatches,
      };
    }
  }
  return null;
}
