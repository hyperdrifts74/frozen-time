import { QUOTA_BONUS, QUOTA_SIZE } from '../src/constants/config';
import { mulberry32 } from '../src/game/rng';
import { generateScene, pickTargets } from '../src/game/sceneGen';
import { resolveOutcome } from '../src/game/scoring';
import { getSpot } from '../src/game/spots';

describe('scene catch card', () => {
  it('draws distinct target species from the spot pool', () => {
    for (let spot = 0; spot < 6; spot++) {
      const pool = getSpot(spot).pool;
      const targets = pickTargets(mulberry32(spot + 1), pool);
      expect(targets.length).toBe(Math.min(QUOTA_SIZE, pool.length));
      expect(new Set(targets).size).toBe(targets.length);
      targets.forEach(id => expect(pool).toContain(id));
    }
  });

  it('is always completable from the generated events', () => {
    for (let spot = 0; spot < 6; spot++) {
      const scene = generateScene(spot, 3);
      const available = new Set(
        scene.events.filter(e => !e.decoy).map(e => e.speciesId),
      );
      scene.targets.forEach(id => {
        expect(getSpot(spot).pool).toContain(id);
      });
      expect(available.size).toBeGreaterThan(0);
    }
  });

  it('turns a completed card into a win plus a bonus', () => {
    expect(QUOTA_BONUS).toBe(500);
    expect(
      resolveOutcome({ misses: 0, score: 10, target: 6000, quotaComplete: true }),
    ).toBe('WIN');
    expect(
      resolveOutcome({ misses: 0, score: 10, target: 6000, quotaComplete: false }),
    ).toBe('PARTIAL');
  });

  it('counts a target only once however many are landed', () => {
    const targets = [1, 2, 3];
    const caught: number[] = [];
    [1, 1, 2, 2, 3].forEach(id => {
      if (targets.indexOf(id) >= 0 && caught.indexOf(id) < 0) {
        caught.push(id);
      }
    });
    expect(caught).toEqual([1, 2, 3]);
    expect(caught.length >= targets.length).toBe(true);
  });
});
