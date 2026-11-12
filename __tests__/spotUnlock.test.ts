import { SPOTS } from '../src/constants/config';
import {
  clampToUnlocked,
  isSpotUnlocked,
  nextUnlock,
  unlockedCount,
} from '../src/game/spots';

describe('spot progression', () => {
  it('always opens the first spot', () => {
    expect(SPOTS[0].unlockAt).toBe(0);
    expect(isSpotUnlocked(0, 0)).toBe(true);
    expect(unlockedCount(0)).toBe(1);
  });

  it('opens deeper spots by total catches', () => {
    expect(isSpotUnlocked(1, 7)).toBe(false);
    expect(isSpotUnlocked(1, 8)).toBe(true);
    expect(unlockedCount(20)).toBe(3);
    expect(unlockedCount(999)).toBe(SPOTS.length);
  });

  it('names what the next unlock needs', () => {
    const next = nextUnlock(0);
    expect(next).not.toBeNull();
    expect(next ? next.index : -1).toBe(1);
    expect(next ? next.need : -1).toBe(8);
    expect(nextUnlock(999)).toBeNull();
  });

  it('refuses to start a locked spot', () => {
    expect(clampToUnlocked(5, 0)).toBe(0);
    expect(clampToUnlocked(2, 20)).toBe(2);
  });
});
