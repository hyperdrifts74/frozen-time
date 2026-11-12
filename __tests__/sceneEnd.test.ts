import { MISS_LIMIT, RIPPLE_MS, SCENE_MS } from '../src/constants/config';
import { generateScene } from '../src/game/sceneGen';
import { resolveOutcome } from '../src/game/scoring';
import { formatClock } from '../src/utils/format';

describe('scene end condition', () => {
  it('runs for exactly 60 seconds', () => {
    expect(SCENE_MS).toBe(60000);
    expect(formatClock(SCENE_MS)).toBe('0:60');
    expect(formatClock(0)).toBe('0:00');
  });

  it('ends on the third empty cast', () => {
    expect(MISS_LIMIT).toBe(3);
    expect(
      resolveOutcome({ misses: 3, score: 5000, target: 400, quotaComplete: true }),
    ).toBe('LOSS');
    expect(
      resolveOutcome({ misses: 2, score: 5000, target: 400, quotaComplete: false }),
    ).toBe('WIN');
  });

  it('never schedules a ripple that outlives the scene clock', () => {
    for (let spot = 0; spot < 6; spot++) {
      const scene = generateScene(spot, 1);
      expect(scene.events.length).toBeGreaterThan(5);
      scene.events.forEach(e => {
        expect(e.atMs + RIPPLE_MS).toBeLessThanOrEqual(SCENE_MS);
        expect(e.atMs).toBeGreaterThan(0);
      });
    }
  });
});
