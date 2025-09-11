import { writable, get } from 'svelte/store';
import { v4 as uuid } from 'uuid';
import { load, save } from './persist';
import type { Habit, Log, SaveData } from './types';
import { browser } from '$app/environment';

interface OldLog { ts: number; diff?: number }
interface OldHabit { id: string; name: string; logs: OldLog[] }

function migrate(data: any): SaveData {
  if (!data) return { habits: [], logs: [] };
  if (Array.isArray(data)) {
    const habits: Habit[] = data.map((h: OldHabit) => {
      const last = h.logs[h.logs.length - 1];
      return {
        id: h.id,
        name: h.name,
        createdAt: new Date().toISOString(),
        goalSeconds: 86400,
        streak: 0,
        lastLoggedAt: last ? new Date(last.ts).toISOString() : undefined
      };
    });
    const logs: Log[] = data.flatMap((h: OldHabit) =>
      h.logs.map(l => ({
        habitId: h.id,
        at: new Date(l.ts).toISOString(),
        deltaSeconds: l.diff !== undefined ? Math.round(l.diff / 1000) : undefined
      }))
    );
    return { habits, logs };
  }
  const habits: Habit[] = Array.isArray(data.habits)
    ? data.habits.map((h: any) => ({
        id: h.id,
        name: h.name,
        createdAt: h.createdAt ?? new Date().toISOString(),
        goalSeconds: h.goalSeconds ?? 86400,
        streak: h.streak ?? 0,
        lastLoggedAt: h.lastLoggedAt
      }))
    : [];
  const logs: Log[] = Array.isArray(data.logs) ? data.logs : [];
  return { habits, logs };
}

const habitsStore = writable<Habit[]>([]);
const logsStore = writable<Log[]>([]);

if (browser) {
  load<any>().then(d => {
    const m = migrate(d);
    habitsStore.set(m.habits);
    logsStore.set(m.logs);
  });
}

function persist() {
  save({ habits: get(habitsStore), logs: get(logsStore) });
}

const clamp = (s: number) => Math.min(Math.max(s, 3600), 2592000);

export const habits = {
  subscribe: habitsStore.subscribe,
  add(name: string) {
    habitsStore.update(hs => {
      const h: Habit = {
        id: uuid(),
        name,
        createdAt: new Date().toISOString(),
        goalSeconds: 86400,
        streak: 0
      };
      return [...hs, h];
    });
    persist();
  },
  log(id: string) {
    const now = new Date();
    let entry: Log | null = null;
    habitsStore.update(hs =>
      hs.map(h => {
        if (h.id !== id) return h;
        if (h.lastLoggedAt) {
          const last = new Date(h.lastLoggedAt).getTime();
          const diffMs = now.getTime() - last;
          if (diffMs < 30000) return h;
          const delta = Math.floor(diffMs / 1000);
          let goal = h.goalSeconds;
          let streak = h.streak;
          if (delta >= goal) {
            streak += 1;
            goal = clamp(Math.round(goal * 1.1));
          } else {
            streak = 0;
            goal = clamp(Math.round(goal * 0.9));
          }
          entry = { habitId: id, at: now.toISOString(), deltaSeconds: delta };
          return { ...h, goalSeconds: goal, streak, lastLoggedAt: now.toISOString() };
        } else {
          entry = { habitId: id, at: now.toISOString() };
          return { ...h, lastLoggedAt: now.toISOString() };
        }
      })
    );
    if (entry) logsStore.update(ls => [...ls, entry]);
    persist();
  },
  editGoal(id: string, seconds: number) {
    habitsStore.update(hs =>
      hs.map(h => (h.id === id ? { ...h, goalSeconds: clamp(Math.round(seconds)) } : h))
    );
    persist();
  },
  resetStreak(id: string) {
    habitsStore.update(hs => hs.map(h => (h.id === id ? { ...h, streak: 0 } : h)));
    persist();
  },
  replace(data: SaveData) {
    const m = migrate(data);
    habitsStore.set(m.habits);
    logsStore.set(m.logs);
    persist();
  }
};

export const logs = {
  subscribe: logsStore.subscribe
};

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [] as string[];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m && parts.length < 2) parts.push(`${m}m`);
  if (!parts.length) parts.push(`${sec}s`);
  return parts.join(' ');
}

export function validate(data: any): data is SaveData {
  if (typeof data !== 'object' || data === null) return false;
  if (!Array.isArray(data.habits) || !Array.isArray(data.logs)) return false;
  const habitsOk = data.habits.every((h: any) =>
    typeof h.id === 'string' &&
    typeof h.name === 'string' &&
    typeof h.createdAt === 'string' &&
    typeof h.goalSeconds === 'number' &&
    typeof h.streak === 'number' &&
    (h.lastLoggedAt === undefined || typeof h.lastLoggedAt === 'string')
  );
  const logsOk = data.logs.every((l: any) =>
    typeof l.habitId === 'string' &&
    typeof l.at === 'string' &&
    (l.deltaSeconds === undefined || typeof l.deltaSeconds === 'number')
  );
  return habitsOk && logsOk;
}
