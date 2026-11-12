import {
  FREEZE_GAIN,
  FREEZE_MISS_DRAIN,
  FREEZE_MS,
  FREEZE_SWEEP_FACTOR,
} from '../constants/config';
import { clamp01 } from '../utils/format';
import { Grade } from './resolve';

export { FREEZE_MS, FREEZE_SWEEP_FACTOR, FREEZE_GAIN, FREEZE_MISS_DRAIN };

/** A clean strike charges the meter: PRIME +20 %, TROPHY +35 %, SMALL +10 %. */
export function chargeFreeze(current: number, grade: Grade): number {
  return clamp01(current + FREEZE_GAIN[grade]);
}

/** An empty cast drains 20 %. */
export function drainFreeze(current: number): number {
  return clamp01(current - FREEZE_MISS_DRAIN);
}

export function canActivateFreeze(current: number): boolean {
  return current >= 1;
}

/** Activation empties the meter and opens a 5 s window. */
export function activateFreeze(current: number): { meter: number; untilOffsetMs: number } {
  if (!canActivateFreeze(current)) {
    return { meter: current, untilOffsetMs: 0 };
  }
  return { meter: 0, untilOffsetMs: FREEZE_MS };
}
