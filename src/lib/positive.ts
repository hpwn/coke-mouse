import { writable, get } from 'svelte/store';
import { v4 as uuid } from 'uuid';
import { load, save } from './persist';
import { browser } from '$app/environment';

export type PositiveHabitId = string;

export interface PositiveHabit {
  id: PositiveHabitId;
  name: string;
  createdAt: number;
}

export interface PositiveHabitLog {
  id: string;
  habitId: PositiveHabitId;
  ts: number;
  note: string;
}

export interface PositiveState {
  habits: Record<PositiveHabitId, PositiveHabit>;
  logs: Record<string, PositiveHabitLog>;
  habitLogIndex: Record<PositiveHabitId, string[]>;
  version: 1;
}

const KEY = 'cokemouse.positive.state.v1';

const emptyState: PositiveState = { habits: {}, logs: {}, habitLogIndex: {}, version: 1 };

const store = writable<PositiveState>(emptyState);

if (browser) {
  load<PositiveState>(KEY).then(d => {
    if (d && d.version === 1) {
      store.set({
        habits: d.habits ?? {},
        logs: d.logs ?? {},
        habitLogIndex: d.habitLogIndex ?? {},
        version: 1
      });
    }
  });
}

let t: any;
function scheduleSave() {
  if (!browser) return;
  clearTimeout(t);
  t = setTimeout(() => save(get(store), KEY), 200);
}

function buildIndex(logs: PositiveHabitLog[]): Record<PositiveHabitId, string[]> {
  const idx: Record<PositiveHabitId, string[]> = {};
  logs
    .sort((a, b) => b.ts - a.ts)
    .forEach(l => {
      idx[l.habitId] = idx[l.habitId] ? [...idx[l.habitId], l.id] : [l.id];
    });
  return idx;
}

export const positive = {
  subscribe: store.subscribe,
  add(name: string) {
    const id = uuid();
    store.update(s => {
      s.habits[id] = { id, name, createdAt: Date.now() };
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
  log(habitId: string, note: string) {
    const id = uuid();
    const entry: PositiveHabitLog = { id, habitId, ts: Date.now(), note };
    store.update(s => {
      s.logs[id] = entry;
      const arr = s.habitLogIndex[habitId] ?? [];
      arr.unshift(id);
      s.habitLogIndex[habitId] = arr;
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
    return ids.map(i => state.logs[i]);
  },
  replace(data: { habits: PositiveHabit[]; logs: PositiveHabitLog[] }) {
    const habitMap: Record<string, PositiveHabit> = {};
    data.habits.forEach(h => (habitMap[h.id] = h));
    const logMap: Record<string, PositiveHabitLog> = {};
    data.logs.forEach(l => (logMap[l.id] = l));
    const index = buildIndex(data.logs);
    store.set({ habits: habitMap, logs: logMap, habitLogIndex: index, version: 1 });
    scheduleSave();
  }
};

export { emptyState as positiveEmptyState };
