import { get } from 'svelte/store';
import { habits, logs, validate as validateNegative } from './store';
import { positive, type PositiveHabit, type PositiveHabitLog } from './positive';
import type { HabitMetricConfig, TimeOfDayMetric } from './metric';
import type { Habit, Log } from './types';

export interface ExportPayloadV2 {
  version: 2;
  exportedAt: number;
  negative: {
    habits: Habit[];
    logs: Log[];
  };
  positive: {
    habits: PositiveHabit[];
    logs: PositiveHabitLog[];
  };
}

export function exportAll(): ExportPayloadV2 {
  const pos = get(positive);
  return {
    version: 2,
    exportedAt: Date.now(),
    negative: { habits: get(habits), logs: get(logs) },
    positive: { habits: Object.values(pos.habits), logs: Object.values(pos.logs) }
  };
}

function isHabitMetricConfig(data: any): data is HabitMetricConfig {
  if (!data || typeof data !== 'object') return false;
  if (data.kind !== 'timeOfDay') return false;
  if (data.wrapHour !== undefined && typeof data.wrapHour !== 'number') return false;
  if (data.lowerIsBetter !== undefined && typeof data.lowerIsBetter !== 'boolean') return false;
  return true;
}

function isTimeOfDayMetric(data: any): data is TimeOfDayMetric {
  if (!data || typeof data !== 'object') return false;
  if (data.kind !== 'timeOfDay') return false;
  if (typeof data.minutesSinceMidnight !== 'number') return false;
  if (typeof data.normalizedMinutes !== 'number') return false;
  if (typeof data.display !== 'string') return false;
  if (typeof data.tzOffsetMin !== 'number') return false;
  return true;
}

function validatePositive(data: any): data is { habits: PositiveHabit[]; logs: PositiveHabitLog[] } {
  if (typeof data !== 'object' || data === null) return false;
  if (!Array.isArray(data.habits) || !Array.isArray(data.logs)) return false;
  const habitsOk = data.habits.every(
    (h: any) =>
      typeof h.id === 'string' &&
      typeof h.name === 'string' &&
      typeof h.createdAt === 'number' &&
      (h.metric === undefined || isHabitMetricConfig(h.metric))
  );
  const logsOk = data.logs.every(
    (l: any) =>
      typeof l.id === 'string' &&
      typeof l.habitId === 'string' &&
      typeof l.ts === 'number' &&
      typeof l.note === 'string' &&
      (l.metric === undefined || isTimeOfDayMetric(l.metric))
  );
  return habitsOk && logsOk;
}

export function importAll(data: any): boolean {
  if (typeof data !== 'object' || data === null) return false;
  if (data.version === 2) {
    if (!validateNegative(data.negative) || !validatePositive(data.positive)) return false;
    habits.replace(data.negative);
    positive.replace({ habits: data.positive.habits, logs: data.positive.logs });
    return true;
  }
  if (data.version === 1) {
    if (!validateNegative(data)) return false;
    habits.replace(data);
    return true;
  }
  return false;
}
