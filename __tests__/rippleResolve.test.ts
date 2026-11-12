import { PEAK_END_MS, PEAK_START_MS, RIPPLE_MS } from '../src/constants/config';
import { gradeForPhase, resolveStrike } from '../src/game/resolve';
import { SceneEvent } from '../src/game/sceneGen';

const fish: SceneEvent = {
  id: 1,
  atMs: 1000,
  lane: 2,
  speciesId: 3,
  decoy: false,
  rings: 2,
};
const decoy: SceneEvent = {
  id: 2,
  atMs: 1000,
  lane: 3,
  speciesId: 0,
  decoy: true,
  rings: 2,
};

describe('ripple strike windows', () => {
  it('maps the strike moment to a grade', () => {
    expect(gradeForPhase(0)).toBe('PRIME');
    expect(gradeForPhase(PEAK_START_MS - 1)).toBe('PRIME');
    expect(gradeForPhase(PEAK_START_MS)).toBe('TROPHY');
    expect(gradeForPhase(PEAK_END_MS - 1)).toBe('TROPHY');
    expect(gradeForPhase(PEAK_END_MS)).toBe('SMALL');
    expect(gradeForPhase(RIPPLE_MS - 1)).toBe('SMALL');
    expect(gradeForPhase(RIPPLE_MS)).toBeNull();
    expect(gradeForPhase(-1)).toBeNull();
  });

  it('lands a trophy on the peak of a live ripple', () => {
    const strike = resolveStrike([fish], 2, 1800, new Set<number>());
    expect(strike.hit).toBe(true);
    expect(strike.grade).toBe('TROPHY');
    expect(strike.speciesId).toBe(3);
  });

  it('reads a decoy, an empty lane and a faded ripple as empty water', () => {
    expect(resolveStrike([decoy], 3, 1500, new Set<number>()).reason).toBe('DECOY');
    expect(resolveStrike([fish], 0, 1500, new Set<number>()).hit).toBe(false);
    expect(
      resolveStrike([fish], 2, 1000 + RIPPLE_MS + 1, new Set<number>()).hit,
    ).toBe(false);
  });

  it('never resolves the same ripple twice', () => {
    const consumed = new Set<number>([1]);
    expect(resolveStrike([fish], 2, 1800, consumed).hit).toBe(false);
  });
});
