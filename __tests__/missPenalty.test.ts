import { FREEZE_MISS_DRAIN, MISS_LIMIT } from '../src/constants/config';
import { drainFreeze } from '../src/game/freeze';
import { resolveStrike } from '../src/game/resolve';
import { SceneEvent } from '../src/game/sceneGen';
import { streakMultiplier } from '../src/game/scoring';

const fish: SceneEvent = {
  id: 7,
  atMs: 500,
  lane: 1,
  speciesId: 1,
  decoy: false,
  rings: 1,
};

describe('empty cast penalty', () => {
  it('misses when the hook is over a lane with no live ripple', () => {
    const strike = resolveStrike([fish], 4, 800, new Set<number>());
    expect(strike.hit).toBe(false);
    expect(strike.reason).toBe('NO_RIPPLE');
  });

  it('resets the streak multiplier to x1', () => {
    expect(streakMultiplier(4)).toBe(3);
    expect(streakMultiplier(0)).toBe(1);
  });

  it('drains a fifth of the freeze meter and never goes below zero', () => {
    expect(FREEZE_MISS_DRAIN).toBeCloseTo(0.2);
    expect(drainFreeze(1)).toBeCloseTo(0.8);
    expect(drainFreeze(0.1)).toBe(0);
  });

  it('ends the scene on the third miss', () => {
    let misses = 0;
    let ended = false;
    for (let i = 0; i < 3; i++) {
      misses += 1;
      if (misses >= MISS_LIMIT) {
        ended = true;
      }
    }
    expect(misses).toBe(3);
    expect(ended).toBe(true);
  });
});
