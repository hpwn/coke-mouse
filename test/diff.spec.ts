import { describe, it, expect } from 'vitest';
import { calcDiff, human } from '../src/lib/store';
import type { Log } from '../src/lib/store';

describe('calcDiff', () => {
  it('computes difference from previous log', () => {
    const now = Date.now();
    const logs: Log[] = [{ ts: now - 1000 }];
    expect(calcDiff(logs, now)).toBe(1000);
    expect(calcDiff([], now)).toBeUndefined();
  });
});

describe('human', () => {
  it('formats milliseconds', () => {
    expect(human(1000)).toBe('1s');
    expect(human(60000)).toBe('1m');
  });
});
