import { OUTCOME_TEXT, resolveOutcome } from '../src/game/scoring';

describe('result headline', () => {
  it('wins on a complete catch card', () => {
    expect(
      resolveOutcome({ misses: 0, score: 120, target: 400, quotaComplete: true }),
    ).toBe('WIN');
  });

  it('wins on the spot target', () => {
    expect(
      resolveOutcome({ misses: 1, score: 400, target: 400, quotaComplete: false }),
    ).toBe('WIN');
  });

  it('is partial when lines came up but the card did not', () => {
    expect(
      resolveOutcome({ misses: 2, score: 399, target: 400, quotaComplete: false }),
    ).toBe('PARTIAL');
  });

  it('loses on three empty casts or on nothing at all', () => {
    expect(
      resolveOutcome({ misses: 3, score: 900, target: 400, quotaComplete: true }),
    ).toBe('LOSS');
    expect(
      resolveOutcome({ misses: 0, score: 0, target: 400, quotaComplete: false }),
    ).toBe('LOSS');
  });

  it('speaks in the words of this game, never a generic Game Over', () => {
    expect(OUTCOME_TEXT.WIN).toBe('ICE CLEARED');
    expect(OUTCOME_TEXT.PARTIAL).toBe('LINES PULLED');
    expect(OUTCOME_TEXT.LOSS).toBe('HOLE RUN DRY');
  });
});
