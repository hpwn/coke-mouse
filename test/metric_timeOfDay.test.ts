import { describe, test, expect } from 'vitest';
import {
  minutesSinceMidnight,
  normalizeByWrap,
  buildTimeOfDayMetric,
  isBetterTimeOfDay
} from '../src/lib/metric';

function withLocal(h: number, m: number, y = 2025, mon = 0, d = 1) {
  return new Date(y, mon, d, h, m, 0, 0);
}

describe('time-of-day metric helpers', () => {
  test('minutesSinceMidnight', () => {
    expect(minutesSinceMidnight(withLocal(0, 0))).toBe(0);
    expect(minutesSinceMidnight(withLocal(23, 59))).toBe(23 * 60 + 59);
  });

  test('normalizeByWrap default wrapHour=18', () => {
    expect(normalizeByWrap(18 * 60, 18)).toBe(0);
    expect(normalizeByWrap(23 * 60, 18)).toBe(300);
    expect(normalizeByWrap(2 * 60, 18)).toBe(480);
  });

  test('buildTimeOfDayMetric + isBetterTimeOfDay (earlier is better)', () => {
    const a = buildTimeOfDayMetric(withLocal(23, 0));
    const b = buildTimeOfDayMetric(withLocal(2, 0));
    expect(isBetterTimeOfDay(a, b)).toBe(true);
  });
});
