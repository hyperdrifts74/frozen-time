import { TIER_COLOR } from '../constants/theme';

export type Tier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGEND';

export interface Species {
  id: number;
  name: string;
  tier: Tier;
  rings: number;
  tell: string;
  base: number;
}

/** The collection book — five local species, each with its ripple tell. */
export const SPECIES: Species[] = [
  {
    id: 1,
    name: 'Frost Perch',
    tier: 'COMMON',
    rings: 1,
    tell: '1 THIN RING · FAST BLOOM',
    base: 40,
  },
  {
    id: 2,
    name: 'Glass Roach',
    tier: 'COMMON',
    rings: 1,
    tell: '1 WIDE RING · SLOW BLOOM',
    base: 60,
  },
  {
    id: 3,
    name: 'Amber Pike',
    tier: 'UNCOMMON',
    rings: 2,
    tell: '2 RINGS · MEDIUM BLOOM',
    base: 120,
  },
  {
    id: 4,
    name: 'Silver Char',
    tier: 'RARE',
    rings: 3,
    tell: '3 RINGS · SLOW PULSE',
    base: 250,
  },
  {
    id: 5,
    name: 'Aurora Sturgeon',
    tier: 'LEGEND',
    rings: 3,
    tell: '3 RINGS · VIOLET SHIMMER',
    base: 600,
  },
];

export const DECOY_TELL = 'RINGS SHRINK INSTEAD OF GROWING';

const WEIGHT_BY_TIER: Record<Tier, number> = {
  COMMON: 5,
  UNCOMMON: 3,
  RARE: 2,
  LEGEND: 1,
};

export function getSpecies(id: number): Species {
  const found = SPECIES.find(s => s.id === id);
  return found || SPECIES[0];
}

export function tierColor(tier: Tier): string {
  return TIER_COLOR[tier];
}

export function speciesWeight(id: number): number {
  return WEIGHT_BY_TIER[getSpecies(id).tier];
}

export const GRADE_LETTER = { SMALL: 'S', PRIME: 'P', TROPHY: 'T' } as const;
