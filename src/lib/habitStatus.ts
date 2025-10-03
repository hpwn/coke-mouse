export type HabitStatus = 'queued' | 'active' | 'paused' | 'archived';

export const DEFAULT_HABIT_STATUS: HabitStatus = 'active';

export const HABIT_STATUSES: HabitStatus[] = ['queued', 'active', 'paused', 'archived'];

export function sanitizeHabitStatus(value: any): HabitStatus {
  if (typeof value !== 'string') return DEFAULT_HABIT_STATUS;
  return HABIT_STATUSES.includes(value as HabitStatus) ? (value as HabitStatus) : DEFAULT_HABIT_STATUS;
}

export function isHabitStatus(value: any): value is HabitStatus {
  return typeof value === 'string' && HABIT_STATUSES.includes(value as HabitStatus);
}
