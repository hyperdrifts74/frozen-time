import { SPOTS } from '../src/constants/config';
import { createFresh, mergeSceneResult } from '../src/game/progressStore';
import { unlockedCount } from '../src/game/spots';

describe('progress statistics', () => {
  it('recomputes totals from the store', () => {
    let state = createFresh();
    state = mergeSceneResult(state, {
      spotIndex: 0,
      score: 820,
      bestStreak: 3,
      freezesUsed: 1,
      catches: [
        { speciesId: 1, grade: 'PRIME' },
        { speciesId: 2, grade: 'TROPHY' },
      ],
    }).data;
    state = mergeSceneResult(state, {
      spotIndex: 1,
      score: 410,
      bestStreak: 5,
      freezesUsed: 2,
      catches: [{ speciesId: 1, grade: 'SMALL' }],
    }).data;

    expect(state.totalCatches).toBe(3);
    expect(state.bestScore).toBe(820);
    expect(state.bestStreak).toBe(5);
    expect(state.freezesUsed).toBe(3);
    expect(state.trophies).toBe(1);
    expect(state.bestPerSpot[0]).toBe(820);
    expect(state.bestPerSpot[1]).toBe(410);
    expect(state.lastSpot).toBe(1);
  });

  it('keeps the best score per spot, never the latest', () => {
    let state = createFresh();
    state = mergeSceneResult(state, {
      spotIndex: 2,
      score: 1500,
      bestStreak: 2,
      freezesUsed: 0,
      catches: [],
    }).data;
    state = mergeSceneResult(state, {
      spotIndex: 2,
      score: 300,
      bestStreak: 1,
      freezesUsed: 0,
      catches: [],
    }).data;
    expect(state.bestPerSpot[2]).toBe(1500);
  });

  it('reports a newly opened spot once the threshold is crossed', () => {
    const catches = [];
    for (let i = 0; i < 8; i++) {
      catches.push({ speciesId: 1, grade: 'SMALL' as const });
    }
    const merged = mergeSceneResult(createFresh(), {
      spotIndex: 0,
      score: 500,
      bestStreak: 8,
      freezesUsed: 0,
      catches,
    });
    expect(merged.data.totalCatches).toBe(8);
    expect(merged.extras.unlockedSpot).toBe(1);
    expect(unlockedCount(merged.data.totalCatches)).toBe(2);
    expect(SPOTS[1].unlockAt).toBe(8);
  });
});
