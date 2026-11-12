import { FREEZE_MS, FREEZE_SWEEP_FACTOR } from '../src/constants/config';
import {
  activateFreeze,
  canActivateFreeze,
  chargeFreeze,
  drainFreeze,
} from '../src/game/freeze';

describe('time freeze meter', () => {
  it('charges by grade', () => {
    expect(chargeFreeze(0, 'SMALL')).toBeCloseTo(0.1);
    expect(chargeFreeze(0, 'PRIME')).toBeCloseTo(0.2);
    expect(chargeFreeze(0, 'TROPHY')).toBeCloseTo(0.35);
  });

  it('never charges past full', () => {
    expect(chargeFreeze(0.9, 'TROPHY')).toBe(1);
  });

  it('only fires at a full meter', () => {
    expect(canActivateFreeze(0.99)).toBe(false);
    expect(canActivateFreeze(1)).toBe(true);
    const blocked = activateFreeze(0.5);
    expect(blocked.untilOffsetMs).toBe(0);
    expect(blocked.meter).toBeCloseTo(0.5);
  });

  it('empties the meter and opens a five second window', () => {
    const fired = activateFreeze(1);
    expect(fired.meter).toBe(0);
    expect(fired.untilOffsetMs).toBe(FREEZE_MS);
    expect(FREEZE_MS).toBe(5000);
    expect(FREEZE_SWEEP_FACTOR).toBeCloseTo(2.5);
  });

  it('is pushed back by every empty cast', () => {
    let meter = 0;
    meter = chargeFreeze(meter, 'TROPHY');
    meter = chargeFreeze(meter, 'TROPHY');
    expect(meter).toBeCloseTo(0.7);
    meter = drainFreeze(meter);
    expect(meter).toBeCloseTo(0.5);
    expect(canActivateFreeze(meter)).toBe(false);
  });
});
