/**
 * One seed per attempt, deterministic and reproducible.
 * Math.random is never used for run content.
 */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return function next(): number {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** seed = spotIndex * 7919 ^ attempt * 104729 */
export function makeSeed(spotIndex: number, attempt: number): number {
  const s = ((spotIndex * 7919) ^ (attempt * 104729)) >>> 0;
  return s === 0 ? 0x9e3779b9 : s;
}

export function randInt(rnd: Rng, minInclusive: number, maxExclusive: number): number {
  const span = maxExclusive - minInclusive;
  if (span <= 0) {
    return minInclusive;
  }
  return minInclusive + Math.floor(rnd() * span);
}

export function pickWeighted<T>(rnd: Rng, items: T[], weights: number[]): T {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += weights[i] || 0;
  }
  if (total <= 0) {
    return items[0];
  }
  let roll = rnd() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i] || 0;
    if (roll <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}
