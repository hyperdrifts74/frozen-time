import { LANES } from '../src/constants/config';
import { clampLane, nextSweepLane, sweepStepMs, SweepDir } from '../src/game/hook';

describe('hook movement', () => {
  it('clamps a tapped lane into 0..4', () => {
    expect(clampLane(-3)).toBe(0);
    expect(clampLane(0)).toBe(0);
    expect(clampLane(2)).toBe(2);
    expect(clampLane(LANES - 1)).toBe(LANES - 1);
    expect(clampLane(99)).toBe(LANES - 1);
    expect(clampLane(NaN)).toBe(0);
  });

  it('bounces the auto-sweep at both edges', () => {
    expect(nextSweepLane(0, 1)).toEqual({ lane: 1, dir: 1 });
    expect(nextSweepLane(4, 1)).toEqual({ lane: 3, dir: -1 });
    expect(nextSweepLane(0, -1)).toEqual({ lane: 1, dir: 1 });
    expect(nextSweepLane(3, -1)).toEqual({ lane: 2, dir: -1 });
  });

  it('walks a full pass in four steps', () => {
    let lane = 0;
    let dir: SweepDir = 1;
    for (let i = 0; i < 4; i++) {
      const n = nextSweepLane(lane, dir);
      lane = n.lane;
      dir = n.dir;
    }
    expect(lane).toBe(LANES - 1);
    // One full pass is four lane steps, so a step is a quarter of SWEEP_MS.
    expect(sweepStepMs(2000, 'STANDARD', false)).toBe(500);
  });
});
