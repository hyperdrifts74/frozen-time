import {
  createFresh,
  discoveredSpecies,
  filledCells,
  hasFullRow,
  mergeSceneResult,
} from '../src/game/progressStore';
import { SPECIES } from '../src/game/species';

describe('collection book', () => {
  it('starts empty with a cell for every species', () => {
    const fresh = createFresh();
    expect(Object.keys(fresh.book)).toHaveLength(SPECIES.length);
    expect(filledCells(fresh)).toBe(0);
    expect(discoveredSpecies(fresh)).toBe(0);
  });

  it('marks species and grade cells from a scene result', () => {
    const { data } = mergeSceneResult(createFresh(), {
      spotIndex: 0,
      score: 300,
      bestStreak: 2,
      freezesUsed: 0,
      catches: [
        { speciesId: 1, grade: 'SMALL' },
        { speciesId: 1, grade: 'PRIME' },
        { speciesId: 2, grade: 'TROPHY' },
      ],
    });
    expect(data.book['1'].SMALL).toBe(true);
    expect(data.book['1'].PRIME).toBe(true);
    expect(data.book['1'].TROPHY).toBe(false);
    expect(data.book['2'].TROPHY).toBe(true);
    expect(filledCells(data)).toBe(3);
    expect(discoveredSpecies(data)).toBe(2);
    expect(hasFullRow(data)).toBe(false);
  });

  it('counts a grade only the first time it is earned', () => {
    const first = mergeSceneResult(createFresh(), {
      spotIndex: 0,
      score: 100,
      bestStreak: 1,
      freezesUsed: 0,
      catches: [{ speciesId: 3, grade: 'PRIME' }],
    });
    expect(first.extras.newGrades).toBe(1);
    const second = mergeSceneResult(first.data, {
      spotIndex: 0,
      score: 100,
      bestStreak: 1,
      freezesUsed: 0,
      catches: [{ speciesId: 3, grade: 'PRIME' }],
    });
    expect(second.extras.newGrades).toBe(0);
  });

  it('completes a row once all three grades are landed', () => {
    const { data } = mergeSceneResult(createFresh(), {
      spotIndex: 0,
      score: 100,
      bestStreak: 3,
      freezesUsed: 0,
      catches: [
        { speciesId: 4, grade: 'SMALL' },
        { speciesId: 4, grade: 'PRIME' },
        { speciesId: 4, grade: 'TROPHY' },
      ],
    });
    expect(hasFullRow(data)).toBe(true);
  });
});
