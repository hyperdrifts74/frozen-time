import { LANES } from '../src/constants/config';
import { makeSeed, mulberry32 } from '../src/game/rng';
import {
  MAX_DECOY_RUN,
  MIN_REAL_FISH,
  MIN_SAME_LANE_GAP_MS,
  generateScene,
  validateScene,
} from '../src/game/sceneGen';

describe('seeded scene generation', () => {
  it('derives the seed from spot and attempt', () => {
    expect(makeSeed(2, 5)).toBe(((2 * 7919) ^ (5 * 104729)) >>> 0);
    expect(makeSeed(0, 1)).not.toBe(makeSeed(0, 2));
  });

  it('replays the same seed identically', () => {
    const a = generateScene(3, 7);
    const b = generateScene(3, 7);
    expect(b.seed).toBe(a.seed);
    expect(b.events).toEqual(a.events);
    expect(b.targets).toEqual(a.targets);
  });

  it('produces a visibly different layout on the next attempt', () => {
    const a = generateScene(2, 1);
    const b = generateScene(2, 2);
    const lanesA = a.events.map(e => e.lane).join('');
    const lanesB = b.events.map(e => e.lane).join('');
    expect(lanesB).not.toBe(lanesA);
  });

  it('passes the solvability check on every spot and attempt', () => {
    for (let spot = 0; spot < 6; spot++) {
      for (let attempt = 1; attempt <= 6; attempt++) {
        const scene = generateScene(spot, attempt);
        expect(validateScene(scene.events)).toBe(true);
        expect(scene.usedFallback).toBe(false);
        const real = scene.events.filter(e => !e.decoy).length;
        expect(real).toBeGreaterThanOrEqual(MIN_REAL_FISH);
        scene.events.forEach(e => {
          expect(e.lane).toBeGreaterThanOrEqual(0);
          expect(e.lane).toBeLessThan(LANES);
        });
      }
    }
  });

  it('rejects a layout with too few fish or too many decoys in a row', () => {
    const decoys = [];
    for (let i = 0; i < MAX_DECOY_RUN + 1; i++) {
      decoys.push({
        id: i,
        atMs: 1000 + i * 2000,
        lane: i % LANES,
        speciesId: 0,
        decoy: true,
        rings: 2,
      });
    }
    expect(validateScene(decoys)).toBe(false);
    expect(validateScene([])).toBe(false);
  });

  it('keeps two ripples in one lane apart', () => {
    const tooClose = [
      { id: 0, atMs: 1000, lane: 1, speciesId: 1, decoy: false, rings: 1 },
      { id: 1, atMs: 1000 + MIN_SAME_LANE_GAP_MS - 1, lane: 1, speciesId: 2, decoy: false, rings: 1 },
    ];
    expect(validateScene(tooClose)).toBe(false);
  });

  it('keeps the generator independent of Math.random', () => {
    const spy = jest.spyOn(Math, 'random');
    generateScene(4, 9);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    const rnd = mulberry32(42);
    const first = rnd();
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(1);
    expect(mulberry32(42)()).toBe(first);
  });
});
