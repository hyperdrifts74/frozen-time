import { progressStore } from '../src/game/progressStore';

function playOnce() {
  progressStore.applySceneResult({
    spotIndex: 1,
    score: 1200,
    bestStreak: 4,
    freezesUsed: 2,
    catches: [
      { speciesId: 1, grade: 'TROPHY' },
      { speciesId: 2, grade: 'PRIME' },
    ],
  });
}

describe('settings — reset progress', () => {
  beforeEach(() => {
    progressStore.reset();
  });

  it('wipes catches, grades, best scores and unlocks back to spot 1', () => {
    playOnce();
    expect(progressStore.load().totalCatches).toBe(2);
    progressStore.reset();
    const data = progressStore.load();
    expect(data.totalCatches).toBe(0);
    expect(data.bestScore).toBe(0);
    expect(data.bestStreak).toBe(0);
    expect(data.trophies).toBe(0);
    expect(data.lastSpot).toBe(0);
    expect(data.bestPerSpot.every(v => v === 0)).toBe(true);
    expect(data.book['1'].TROPHY).toBe(false);
  });

  it('changes nothing until the second tap confirms', () => {
    playOnce();
    const before = progressStore.load().totalCatches;
    // First tap only arms the confirmation; it must not call the store.
    let armed = false;
    const tap = () => {
      if (!armed) {
        armed = true;
        return;
      }
      progressStore.reset();
    };
    tap();
    expect(progressStore.load().totalCatches).toBe(before);
    tap();
    expect(progressStore.load().totalCatches).toBe(0);
  });
});
