import { computePoints, streakMultiplier } from '../src/game/scoring';
import { getSpecies } from '../src/game/species';

describe('catch streak', () => {
  it('climbs x1 -> x1.5 -> x2 -> x3 and caps there', () => {
    expect(streakMultiplier(1)).toBe(1);
    expect(streakMultiplier(2)).toBe(1.5);
    expect(streakMultiplier(3)).toBe(2);
    expect(streakMultiplier(4)).toBe(3);
    expect(streakMultiplier(9)).toBe(3);
  });

  it('multiplies every award', () => {
    const base = getSpecies(1).base;
    expect(computePoints(base, 'PRIME', 1, false)).toBe(40);
    expect(computePoints(base, 'PRIME', 2, false)).toBe(60);
    expect(computePoints(base, 'PRIME', 4, false)).toBe(120);
  });

  it('grades the award: small 0.8, prime 1.0, trophy 1.4', () => {
    const base = getSpecies(4).base;
    expect(computePoints(base, 'SMALL', 1, false)).toBe(200);
    expect(computePoints(base, 'PRIME', 1, false)).toBe(250);
    expect(computePoints(base, 'TROPHY', 1, false)).toBe(350);
  });

  it('pays a trophy sturgeon on a x3 streak without assist', () => {
    expect(computePoints(getSpecies(5).base, 'TROPHY', 4, true)).toBe(2772);
  });

  it('is reset to x1 by an empty cast', () => {
    let streak = 4;
    expect(streakMultiplier(streak)).toBe(3);
    streak = 0;
    expect(streakMultiplier(streak)).toBe(1);
  });
});
