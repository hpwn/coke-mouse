import { writable, get } from 'svelte/store';
import { v4 as uuid } from 'uuid';
import { load, save } from './persist';
import { browser } from '$app/environment';
import { clampWrapHour, normalizeByWrap, minutesToDisplay } from './metric';
import { DEFAULT_HABIT_STATUS, type HabitStatus, sanitizeHabitStatus } from './habitStatus';
import type { HabitMetricConfig, TimeOfDayMetric } from './metric';

export type PositiveHabitId = string;

export interface PositiveHabit {
  id: PositiveHabitId;
  name: string;
  createdAt: number;
  metric?: HabitMetricConfig;
  status?: HabitStatus;
}

export interface PositiveHabitLog {
  id: string;
  habitId: PositiveHabitId;
  ts: number;
  note: string;
  metric?: TimeOfDayMetric;
}

export interface PositiveState {
  habits: Record<PositiveHabitId, PositiveHabit>;
  logs: Record<string, PositiveHabitLog>;
  habitLogIndex: Record<PositiveHabitId, string[]>;
  version: 2;
}

const KEY = 'cokemouse.positive.state.v2';
const LEGACY_KEY = 'cokemouse.positive.state.v1';

const emptyState: PositiveState = { habits: {}, logs: {}, habitLogIndex: {}, version: 2 };

const store = writable<PositiveState>(emptyState);

interface PersistedStateLike {
  habits?: any;
  logs?: any;
  habitLogIndex?: Record<string, string[]>;
  version?: number;
}

const clampMinutes = (value: any): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 1439) return 1439;
  return rounded;
};

function sanitizeMetricConfig(input: any): HabitMetricConfig | undefined {
  if (!input || typeof input !== 'object') return undefined;
  if (input.kind !== 'timeOfDay') return undefined;
  const wrapHour = clampWrapHour(typeof input.wrapHour === 'number' ? input.wrapHour : undefined);
  const lowerIsBetter =
    input.lowerIsBetter === undefined ? undefined : Boolean(input.lowerIsBetter);
  const cfg: HabitMetricConfig = { kind: 'timeOfDay' };
  if (wrapHour !== undefined) cfg.wrapHour = wrapHour;
  if (lowerIsBetter !== undefined) cfg.lowerIsBetter = lowerIsBetter;
  return cfg;
}

function sanitizeMetric(
  input: any,
  cfg?: HabitMetricConfig
): TimeOfDayMetric | undefined {
  if (!input || typeof input !== 'object') return undefined;
  if (input.kind !== 'timeOfDay') return undefined;
  const minutes = clampMinutes(input.minutesSinceMidnight);
  if (minutes === undefined) return undefined;
  const wrapHour = cfg?.wrapHour ?? 18;
  const normalized =
    typeof input.normalizedMinutes === 'number' && Number.isFinite(input.normalizedMinutes)
      ? ((Math.round(input.normalizedMinutes) % 1440) + 1440) % 1440
      : normalizeByWrap(minutes, wrapHour);
  const display = typeof input.display === 'string' ? input.display : minutesToDisplay(minutes);
  const tzOffset =
    typeof input.tzOffsetMin === 'number' && Number.isFinite(input.tzOffsetMin)
      ? Math.round(input.tzOffsetMin)
      : 0;
  return {
    kind: 'timeOfDay',
    minutesSinceMidnight: minutes,
    normalizedMinutes: normalized,
    display,
    tzOffsetMin: tzOffset
  };
}

function sanitizeHabit(input: any): PositiveHabit | null {
  if (!input || typeof input !== 'object') return null;
  const id = typeof input.id === 'string' ? input.id : undefined;
  const name = typeof input.name === 'string' ? input.name : undefined;
  const createdAt =
    typeof input.createdAt === 'number' && Number.isFinite(input.createdAt)
      ? input.createdAt
      : Date.now();
  if (!id || !name) return null;
  const metric = sanitizeMetricConfig(input.metric);
  const habit: PositiveHabit = { id, name, createdAt };
  if (metric) habit.metric = metric;
  habit.status = sanitizeHabitStatus(input.status);
  return habit;
}

function sanitizeLog(input: any, habits: Record<string, PositiveHabit>): PositiveHabitLog | null {
  if (!input || typeof input !== 'object') return null;
  const id = typeof input.id === 'string' ? input.id : undefined;
  const habitId = typeof input.habitId === 'string' ? input.habitId : undefined;
  if (!id || !habitId || !habits[habitId]) return null;
  const ts =
    typeof input.ts === 'number' && Number.isFinite(input.ts) ? input.ts : Date.now();
  const note = typeof input.note === 'string' ? input.note : '';
  const metric = sanitizeMetric(input.metric, habits[habitId].metric);
  const log: PositiveHabitLog = { id, habitId, ts, note };
  if (metric) log.metric = metric;
  return log;
}

function collectValues<T>(value: any): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') return Object.values(value) as T[];
  return [];
}

function sanitizeState(data: PersistedStateLike | null): PositiveState | null {
  if (!data || typeof data !== 'object') return null;
  const habits: Record<string, PositiveHabit> = {};
  for (const raw of collectValues<PositiveHabit>(data.habits)) {
    const habit = sanitizeHabit(raw);
    if (habit) habits[habit.id] = habit;
  }
  const logs: Record<string, PositiveHabitLog> = {};
  for (const raw of collectValues<PositiveHabitLog>(data.logs)) {
    const log = sanitizeLog(raw, habits);
    if (log) logs[log.id] = log;
  }
  const index = buildIndex(Object.values(logs));
  return { habits, logs, habitLogIndex: index, version: 2 };
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave() {
  if (!browser) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(get(store), KEY), 200);
}

function buildIndex(logs: PositiveHabitLog[]): Record<PositiveHabitId, string[]> {
  const idx: Record<PositiveHabitId, string[]> = {};
  logs
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .forEach(l => {
      idx[l.habitId] = idx[l.habitId] ? [...idx[l.habitId], l.id] : [l.id];
    });
  return idx;
}

if (browser) {
  (async () => {
    const current = await load<PersistedStateLike>(KEY);
    const state = sanitizeState(current);
    if (state) {
      store.set(state);
      return;
    }
    const legacy = await load<PersistedStateLike>(LEGACY_KEY);
    const migrated = sanitizeState(legacy);
    if (migrated) {
      store.set(migrated);
      await save(migrated, KEY);
    }
  })();
}

export const positive = {
  subscribe: store.subscribe,
  add(name: string, metric?: HabitMetricConfig) {
    const id = uuid();
    const metricCfg = sanitizeMetricConfig(metric);
    store.update(s => {
      const habit: PositiveHabit = {
        id,
        name,
        createdAt: Date.now(),
        status: DEFAULT_HABIT_STATUS
      };
      if (metricCfg) habit.metric = metricCfg;
      s.habits[id] = habit;
      s.habitLogIndex[id] = s.habitLogIndex[id] ?? [];
      return s;
    });
    scheduleSave();
  },
  quickAddQueuedHabit(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = uuid();
    store.update(s => {
      const habit: PositiveHabit = {
        id,
        name: trimmed,
        createdAt: Date.now(),
        status: 'queued'
      };
      s.habits[id] = habit;
      s.habitLogIndex[id] = s.habitLogIndex[id] ?? [];
      return s;
    });
    scheduleSave();
  },
  rename(id: string, name: string) {
    store.update(s => {
      if (s.habits[id]) s.habits[id].name = name;
      return s;
    });
    scheduleSave();
  },
  setMetric(id: string, metric?: HabitMetricConfig) {
    const metricCfg = sanitizeMetricConfig(metric);
    store.update(s => {
      if (!s.habits[id]) return s;
      if (metricCfg) {
        s.habits[id].metric = metricCfg;
      } else {
        delete s.habits[id].metric;
      }
      return s;
    });
    scheduleSave();
  },
  setHabitStatus(id: string, status: HabitStatus) {
    store.update(s => {
      if (!s.habits[id]) return s;
      s.habits[id].status = sanitizeHabitStatus(status);
      return s;
    });
    scheduleSave();
  },
  log(
    habitId: string,
    note = '',
    options?: { metric?: TimeOfDayMetric; ts?: number }
  ) {
    const state = get(store);
    const habit = state.habits[habitId];
    if (!habit) return;
    const metric =
      habit.metric?.kind === 'timeOfDay' && options?.metric?.kind === 'timeOfDay'
        ? sanitizeMetric(options.metric, habit.metric)
        : undefined;
    const id = uuid();
    const ts = typeof options?.ts === 'number' && Number.isFinite(options.ts)
      ? options.ts
      : Date.now();
    const entry: PositiveHabitLog = { id, habitId, ts, note };
    if (metric) entry.metric = metric;
    store.update(s => {
      s.logs[id] = entry;
      const existing = s.habitLogIndex[habitId] ?? [];
      const ids = [...existing, id].filter(Boolean);
      ids.sort((a, b) => {
        const logA = s.logs[a];
        const logB = s.logs[b];
        return (logB?.ts ?? 0) - (logA?.ts ?? 0);
      });
      s.habitLogIndex[habitId] = ids;
      return s;
    });
    scheduleSave();
  },
  editLog(logId: string, note: string) {
    store.update(s => {
      if (s.logs[logId]) s.logs[logId].note = note;
      return s;
    });
    scheduleSave();
  },
  deleteLog(logId: string) {
    store.update(s => {
      const log = s.logs[logId];
      if (!log) return s;
      delete s.logs[logId];
      const arr = s.habitLogIndex[log.habitId] ?? [];
      s.habitLogIndex[log.habitId] = arr.filter(id => id !== logId);
      return s;
    });
    scheduleSave();
  },
  deleteHabit(habitId: string) {
    store.update(s => {
      if (!s.habits[habitId]) {
        if (import.meta.env.DEV) console.warn('deleteHabit: missing', habitId);
        return s;
      }
      delete s.habits[habitId];
      const ids = s.habitLogIndex[habitId] ?? [];
      ids.forEach(id => delete s.logs[id]);
      delete s.habitLogIndex[habitId];
      return s;
    });
    scheduleSave();
  },
  getLogs(habitId: string): PositiveHabitLog[] {
    const state = get(store);
    const ids = state.habitLogIndex[habitId] ?? [];
    return ids.map(i => state.logs[i]).filter(Boolean);
  },
  replace(data: { habits: PositiveHabit[]; logs: PositiveHabitLog[] }) {
    const habitMap: Record<string, PositiveHabit> = {};
    data.habits.forEach(h => {
      const metric = sanitizeMetricConfig(h.metric);
      const habit: PositiveHabit = {
        id: h.id,
        name: h.name,
        createdAt: h.createdAt,
        status: sanitizeHabitStatus(h.status)
      };
      if (metric) habit.metric = metric;
      habitMap[h.id] = habit;
    });
    const logMap: Record<string, PositiveHabitLog> = {};
    data.logs.forEach(l => {
      const habit = habitMap[l.habitId];
      if (!habit) return;
      const metric = sanitizeMetric(l.metric, habit.metric);
      const log: PositiveHabitLog = {
        id: l.id,
        habitId: l.habitId,
        ts: l.ts,
        note: l.note ?? ''
      };
      if (metric) log.metric = metric;
      logMap[l.id] = log;
    });
    const index = buildIndex(Object.values(logMap));
    store.set({ habits: habitMap, logs: logMap, habitLogIndex: index, version: 2 });
    scheduleSave();
  }
};

export { emptyState as positiveEmptyState };
