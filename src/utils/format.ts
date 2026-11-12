/** Thousands separators without Intl (hoisting an Intl formatter per render is wasteful). */
export function formatNum(value: number): string {
  const n = Math.max(0, Math.round(value));
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const fromEnd = s.length - i;
    out += s[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) {
      out += ',';
    }
  }
  return out;
}

/** Scene clock, written the way the HUD shows it: 0:60 down to 0:00. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total - mm * 60;
  if (mm === 1 && ss === 0) {
    return '0:60';
  }
  return mm + ':' + (ss < 10 ? '0' : '') + ss;
}

/** 1 -> x1, 1.5 -> x1.5 */
export function formatMult(m: number): string {
  return 'x' + (Number.isInteger(m) ? String(m) : m.toFixed(1));
}

export function clamp01(v: number): number {
  if (v < 0) {
    return 0;
  }
  if (v > 1) {
    return 1;
  }
  return v;
}
