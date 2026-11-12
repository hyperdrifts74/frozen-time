import * as fs from 'fs';
import * as path from 'path';

const SRC = path.join(__dirname, '..', 'src');

function walk(dir: string, out: string[]): string[] {
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  });
  return out;
}

const FILES = walk(SRC, []);
const SOURCE = FILES.map(f => fs.readFileSync(f, 'utf8')).join('\n');

describe('offline, no-money contract', () => {
  it('finds source files to check', () => {
    expect(FILES.length).toBeGreaterThan(20);
  });

  it('makes no network call of any kind', () => {
    expect(SOURCE).not.toMatch(/\bfetch\s*\(/);
    expect(SOURCE).not.toMatch(/XMLHttpRequest/);
    expect(SOURCE).not.toMatch(/WebSocket/);
    expect(SOURCE).not.toMatch(/https?:\/\//);
  });

  it('has no monetization or real-money surface', () => {
    expect(SOURCE).not.toMatch(/AdMob|admob|InterstitialAd|RewardedAd/);
    expect(SOURCE).not.toMatch(/InAppPurchase|\biap\b|billing/i);
    expect(SOURCE).not.toMatch(/paywall|premium|subscription/i);
  });

  it('uses the forbidden gesture-handler dependency nowhere', () => {
    expect(SOURCE).not.toMatch(/react-native-gesture-handler/);
    expect(SOURCE).not.toMatch(/GestureDetector/);
  });

  it('keeps the native driver off layout properties', () => {
    expect(SOURCE).not.toMatch(/useNativeDriver:\s*true[\s\S]{0,40}toValue[\s\S]{0,40}width/);
  });
});
