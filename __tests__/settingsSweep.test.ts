import { SWEEP_MULTIPLIER } from '../src/constants/config';
import { sweepStepMs } from '../src/game/hook';
import { getSpot } from '../src/game/spots';
import { progressStore } from '../src/game/progressStore';

describe('settings — hook sweep', () => {
  beforeEach(() => {
    progressStore.reset();
  });

  it('maps the three chips to real multipliers', () => {
    expect(SWEEP_MULTIPLIER.CALM).toBeCloseTo(1.35);
    expect(SWEEP_MULTIPLIER.STANDARD).toBeCloseTo(1.0);
    expect(SWEEP_MULTIPLIER.BRISK).toBeCloseTo(0.75);
  });

  it('changes the step time of the next scene', () => {
    const base = getSpot(0).sweepMs;
    const calm = sweepStepMs(base, 'CALM', false);
    const standard = sweepStepMs(base, 'STANDARD', false);
    const brisk = sweepStepMs(base, 'BRISK', false);
    expect(calm).toBeGreaterThan(standard);
    expect(brisk).toBeLessThan(standard);
    expect(standard).toBe(Math.round(base / 4));
  });

  it('slows the sweep further while time freeze is running', () => {
    const base = getSpot(3).sweepMs;
    expect(sweepStepMs(base, 'STANDARD', true)).toBeGreaterThan(
      sweepStepMs(base, 'STANDARD', false),
    );
  });

  it('persists the choice', () => {
    progressStore.update(d => ({ ...d, sweep: 'CALM' }));
    expect(progressStore.load().sweep).toBe('CALM');
    progressStore.update(d => ({ ...d, sweep: 'BRISK' }));
    expect(progressStore.load().sweep).toBe('BRISK');
  });
});
