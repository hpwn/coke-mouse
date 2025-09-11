import { describe, it, expect, vi } from 'vitest';
import { isToday, isYesterday, yyyyMmDd } from '../src/lib/date';

describe('date utilities', () => {
  it('identifies today and yesterday', () => {
    vi.setSystemTime(new Date('2024-06-02T12:00:00Z'));
    const today = Date.now();
    const yesterday = today - 86400000;
    expect(isToday(today)).toBe(true);
    expect(isYesterday(yesterday)).toBe(true);
    expect(yyyyMmDd(today)).toBe('2024-06-02');
  });
});
