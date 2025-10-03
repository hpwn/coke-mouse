import type { Habit } from './types';
import type { PositiveHabit } from './positive';
import { DEFAULT_HABIT_STATUS, type HabitStatus, sanitizeHabitStatus } from './habitStatus';

interface DailyAddOptions {
  positiveHabits: PositiveHabit[];
  negativeHabits: Habit[];
  now?: Date;
}

export function shouldShowDailyAddOne({ positiveHabits, negativeHabits, now }: DailyAddOptions): boolean {
  const current = now ?? new Date();
  const start = new Date(current);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const startTs = start.getTime();
  const endTs = end.getTime();
  const positiveToday = positiveHabits.some(habit => habit.createdAt >= startTs && habit.createdAt < endTs);
  if (positiveToday) return false;
  const negativeToday = negativeHabits.some(habit => {
    const created = new Date(habit.createdAt).getTime();
    return created >= startTs && created < endTs;
  });
  return !negativeToday;
}

interface WeeklyStartOptions {
  positiveHabits: PositiveHabit[];
  negativeHabits: Habit[];
  weekStarts?: 'sun' | 'mon';
  now?: Date;
}

function hasQueued(habits: { status?: HabitStatus }[]): boolean {
  return habits.some(h => (h.status ? sanitizeHabitStatus(h.status) : DEFAULT_HABIT_STATUS) === 'queued');
}

export function shouldShowWeeklyStartOne({
  positiveHabits,
  negativeHabits,
  weekStarts = 'sun',
  now
}: WeeklyStartOptions): boolean {
  const current = now ?? new Date();
  const startIndex = weekStarts === 'mon' ? 1 : 0;
  if (current.getDay() !== startIndex) return false;
  const queuedPositive = hasQueued(positiveHabits);
  const queuedNegative = hasQueued(negativeHabits);
  return queuedPositive || queuedNegative;
}
