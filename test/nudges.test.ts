import { describe, it, expect } from 'vitest';
import { shouldShowDailyAddOne, shouldShowWeeklyStartOne } from '../src/lib/nudges';
import type { PositiveHabit } from '../src/lib/positive';
import type { Habit } from '../src/lib/types';

const makePositive = (overrides: Partial<PositiveHabit> = {}): PositiveHabit => ({
  id: 'p-' + Math.random(),
  name: 'pos',
  createdAt: Date.now(),
  ...overrides
});

const makeNegative = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'n-' + Math.random(),
  name: 'neg',
  createdAt: new Date().toISOString(),
  goalSeconds: 86400,
  streak: 0,
  ...overrides
});

describe('nudges', () => {
  it('daily add one is true when no habits today', () => {
    const now = new Date('2023-01-01T12:00:00Z');
    const result = shouldShowDailyAddOne({ positiveHabits: [], negativeHabits: [], now });
    expect(result).toBe(true);
  });

  it('daily add one is false when habit created today', () => {
    const now = new Date('2023-01-01T12:00:00Z');
    const habit = makePositive({ createdAt: now.getTime() });
    const result = shouldShowDailyAddOne({ positiveHabits: [habit], negativeHabits: [], now });
    expect(result).toBe(false);
  });

  it('weekly start one true only on week start with queued habits', () => {
    const monday = new Date('2023-01-02T08:00:00Z');
    const queued = makePositive({ status: 'queued', createdAt: monday.getTime() });
    const result = shouldShowWeeklyStartOne({
      positiveHabits: [queued],
      negativeHabits: [],
      weekStarts: 'mon',
      now: monday
    });
    expect(result).toBe(true);
  });

  it('weekly start one false when not start of week or no queued', () => {
    const tuesday = new Date('2023-01-03T08:00:00Z');
    const active = makeNegative({ status: 'active', createdAt: '2023-01-01T00:00:00Z' });
    const result = shouldShowWeeklyStartOne({
      positiveHabits: [],
      negativeHabits: [active],
      weekStarts: 'mon',
      now: tuesday
    });
    expect(result).toBe(false);
  });
});
