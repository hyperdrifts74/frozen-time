/**
 * FrozenTime — visual theme.
 * Preset: OCEAN_FRESH (design-system/presets.ts) with exactly two permitted
 * accent overrides: aurora violet + aurora mint.
 * Style layer: AURORA / GRADIENT_MESH (soft gradient blobs, glow, radius 20-28).
 */

export const THEME = {
  name: 'OCEAN_FRESH',

  colors: {
    // light screens
    ice: '#E8F4F8',
    iceMid: '#D1E7EE',
    iceDeep: '#B8DBE5',
    iceLocked: '#9DCEDB',

    // accents
    accent: '#00A6CB',
    accentDeep: '#00558B',
    violet: '#6E5BD8', // override 1 — freeze / rare tier / aurora blob
    mint: '#5FE3C0', // override 2 — success / legend tier / score on dark

    // deep water (Loader / Game board / Result)
    water1: '#06202F',
    water2: '#0B3246',
    water3: '#124E63',

    // text
    textDark: '#0A2A3A',
    textDarkSoft: '#4D7B8E',
    textLight: '#EAF7FC',
    textLightSoft: '#9FC6D6',
    textDim: '#7FA9BD',

    warn: '#E0734F',
    white: '#FFFFFF',
  },

  gradients: {
    cta: ['#00A6CB', '#00558B'] as const,
    freezeMeter: ['#6E5BD8', '#5FE3C0'] as const,
    loaderBase: ['#06202F', '#0B3246', '#124E63'] as const,
    loaderAurora: [
      'rgba(110,91,216,0.00)',
      'rgba(110,91,216,0.30)',
      'rgba(95,227,192,0.18)',
    ] as const,
    light: ['#E8F4F8', '#D1E7EE', '#B8DBE5'] as const,
    result: ['#124E63', '#0B3246', '#06202F'] as const,
    board: ['#0B3246', '#06202F'] as const,
    heroOverlay: ['rgba(6,32,47,0.05)', 'rgba(6,32,47,0.55)'] as const,
    loaderBar: ['#00A6CB', '#5FE3C0'] as const,
  },

  surface: {
    lightStrong: 'rgba(255,255,255,0.58)',
    light: 'rgba(255,255,255,0.50)',
    lightSoft: 'rgba(255,255,255,0.46)',
    borderLight: 'rgba(255,255,255,0.72)',
    borderInk: 'rgba(0,85,139,0.14)',
    dark: 'rgba(6,32,47,0.72)',
    darkSoft: 'rgba(6,32,47,0.42)',
    darkFaint: 'rgba(6,32,47,0.30)',
    borderDark: 'rgba(234,247,252,0.14)',
    borderDarkSoft: 'rgba(234,247,252,0.22)',
    onDark: 'rgba(234,247,252,0.10)',
  },

  radius: {
    chip: 14,
    button: 18,
    tile: 20,
    card: 24,
    pill: 999,
  },

  // Glow instead of hard shadow lines (AURORA style).
  glow: {
    cta: {
      shadowColor: '#00558B',
      shadowOpacity: 0.4,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 9,
    },
    tile: {
      shadowColor: '#00558B',
      shadowOpacity: 0.28,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    violet: {
      shadowColor: '#6E5BD8',
      shadowOpacity: 0.34,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: 7,
    },
  },

  type: {
    hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: 5 },
    title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 2 },
    section: { fontSize: 17, fontWeight: '800' as const, letterSpacing: 2 },
    body: { fontSize: 15, fontWeight: '500' as const },
    label: { fontSize: 13, fontWeight: '700' as const },
    caption: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.4 },
    micro: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 2.4 },
    num: { fontSize: 22, fontWeight: '800' as const },
  },

  spring: {
    entry: { tension: 46, friction: 7 },
    press: { tension: 300, friction: 12 },
    pop: { tension: 240, friction: 10 },
  },
} as const;

export const TIER_COLOR = {
  COMMON: THEME.colors.iceLocked,
  UNCOMMON: THEME.colors.accent,
  RARE: THEME.colors.violet,
  LEGEND: THEME.colors.mint,
} as const;

export type ThemeType = typeof THEME;
