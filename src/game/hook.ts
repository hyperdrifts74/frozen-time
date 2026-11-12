import { FREEZE_SWEEP_FACTOR, LANES, SWEEP_MULTIPLIER } from '../constants/config';

export type SweepSetting = keyof typeof SWEEP_MULTIPLIER;
export type SweepDir = 1 | -1;

export function clampLane(lane: number): number {
  if (!Number.isFinite(lane)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(lane), 0), LANES - 1);
}

/** The hook walks lane centres and bounces at the edges. */
export function nextSweepLane(
  lane: number,
  dir: SweepDir,
): { lane: number; dir: SweepDir } {
  const candidate = lane + dir;
  if (candidate > LANES - 1) {
    return { lane: LANES - 2, dir: -1 };
  }
  if (candidate < 0) {
    return { lane: 1, dir: 1 };
  }
  return { lane: candidate, dir };
}

/** One full pass is SWEEP_MS, so a single lane step is a quarter of it. */
export function sweepStepMs(
  baseSweepMs: number,
  setting: SweepSetting,
  frozen: boolean,
): number {
  const base = (baseSweepMs * SWEEP_MULTIPLIER[setting]) / (LANES - 1);
  return Math.round(frozen ? base * FREEZE_SWEEP_FACTOR : base);
}
