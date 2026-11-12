import { ASSIST_OFF_BONUS } from '../src/constants/config';
import { progressStore } from '../src/game/progressStore';
import { computePoints } from '../src/game/scoring';
import { getSpecies } from '../src/game/species';

describe('settings — ripple assist', () => {
  beforeEach(() => {
    progressStore.reset();
  });

  it('pays ten percent more with the timing arc turned off', () => {
    expect(ASSIST_OFF_BONUS).toBeCloseTo(1.1);
    const base = getSpecies(3).base;
    const on = computePoints(base, 'PRIME', 1, false);
    const off = computePoints(base, 'PRIME', 1, true);
    expect(on).toBe(120);
    expect(off).toBe(132);
    expect(off).toBeGreaterThan(on);
  });

  it('is a real decision on every grade', () => {
    const base = getSpecies(5).base;
    expect(computePoints(base, 'TROPHY', 4, true)).toBeGreaterThan(
      computePoints(base, 'TROPHY', 4, false),
    );
  });

  it('persists the choice', () => {
    expect(progressStore.load().assist).toBe('ON');
    progressStore.update(d => ({ ...d, assist: 'OFF' }));
    expect(progressStore.load().assist).toBe('OFF');
  });
});
