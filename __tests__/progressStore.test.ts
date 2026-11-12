import { progressStore } from '../src/game/progressStore';

describe('progress repository', () => {
  beforeEach(() => {
    progressStore.reset();
  });

  it('starts from a fresh profile', () => {
    const data = progressStore.load();
    expect(data.totalCatches).toBe(0);
    expect(data.lastSpot).toBe(0);
    expect(data.sweep).toBe('STANDARD');
    expect(data.assist).toBe('ON');
  });

  it('writes a scene result through and reads it back everywhere', () => {
    const extras = progressStore.applySceneResult({
      spotIndex: 0,
      score: 640,
      bestStreak: 2,
      freezesUsed: 1,
      catches: [{ speciesId: 2, grade: 'PRIME' }],
    });
    expect(extras.newGrades).toBe(1);
    const data = progressStore.load();
    expect(data.totalCatches).toBe(1);
    expect(data.bestScore).toBe(640);
    expect(data.book['2'].PRIME).toBe(true);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const seen: number[] = [];
    const off = progressStore.subscribe(d => seen.push(d.totalCatches));
    progressStore.applySceneResult({
      spotIndex: 0,
      score: 10,
      bestStreak: 1,
      freezesUsed: 0,
      catches: [{ speciesId: 1, grade: 'SMALL' }],
    });
    off();
    progressStore.applySceneResult({
      spotIndex: 0,
      score: 10,
      bestStreak: 1,
      freezesUsed: 0,
      catches: [{ speciesId: 1, grade: 'PRIME' }],
    });
    expect(seen).toEqual([1]);
    expect(progressStore.load().totalCatches).toBe(2);
  });

  it('updates settings without touching progress', () => {
    progressStore.applySceneResult({
      spotIndex: 0,
      score: 100,
      bestStreak: 1,
      freezesUsed: 0,
      catches: [{ speciesId: 1, grade: 'SMALL' }],
    });
    progressStore.update(d => ({ ...d, sweep: 'BRISK' }));
    const data = progressStore.load();
    expect(data.sweep).toBe('BRISK');
    expect(data.totalCatches).toBe(1);
  });
});
