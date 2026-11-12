import { ASSIST_OFF_BONUS, MISS_LIMIT, QUOTA_BONUS } from '../constants/config';
import { Grade } from './resolve';

export { QUOTA_BONUS };

export const GRADE_FACTOR: Record<Grade, number> = {
  SMALL: 0.8,
  PRIME: 1.0,
  TROPHY: 1.4,
};

/** Streak ladder: x1 -> x1.5 -> x2 -> x3 (capped). */
export const STREAK_LADDER = [1, 1, 1.5, 2, 3];
export const MAX_STREAK_MULT = 3;

export function streakMultiplier(streak: number): number {
  if (streak < 0) {
    return 1;
  }
  if (streak >= STREAK_LADDER.length) {
    return MAX_STREAK_MULT;
  }
  return STREAK_LADDER[streak];
}

/** points = round(base x gradeFactor x streakMultiplier x assistBonus) */
export function computePoints(
  base: number,
  grade: Grade,
  streak: number,
  assistOff: boolean,
): number {
  const bonus = assistOff ? ASSIST_OFF_BONUS : 1;
  return Math.round(base * GRADE_FACTOR[grade] * streakMultiplier(streak) * bonus);
}

export type Outcome = 'WIN' | 'PARTIAL' | 'LOSS';

export const OUTCOME_TEXT: Record<Outcome, string> = {
  WIN: 'ICE CLEARED',
  PARTIAL: 'LINES PULLED',
  LOSS: 'HOLE RUN DRY',
};

export const OUTCOME_NOTE: Record<Outcome, string> = {
  WIN: 'THE CARD IS FULL — THIS HOLE IS FISHED OUT',
  PARTIAL: 'LINES CAME UP, THE CARD DID NOT',
  LOSS: 'THREE EMPTY CASTS — THE HOLE RAN DRY',
};

export function resolveOutcome(input: {
  misses: number;
  score: number;
  target: number;
  quotaComplete: boolean;
}): Outcome {
  if (input.misses >= MISS_LIMIT) {
    return 'LOSS';
  }
  if (input.quotaComplete || input.score >= input.target) {
    return 'WIN';
  }
  if (input.score > 0) {
    return 'PARTIAL';
  }
  return 'LOSS';
}
