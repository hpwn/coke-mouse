import { writable } from 'svelte/store';
import { v4 as uuid } from 'uuid';
import { load, save } from './persist';

export interface Log {
  ts: number;
  diff?: number;
}

export interface Habit {
  id: string;
  name: string;
  logs: Log[];
}

export function calcDiff(logs: Log[], now: number): number | undefined {
  const prev = logs[logs.length - 1];
  return prev ? now - prev.ts : undefined;
}

export function human(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h`;
}

function validateLog(l: any): l is Log {
  return typeof l?.ts === 'number' && (l.diff === undefined || typeof l.diff === 'number');
}

export function validate(data: any): data is Habit[] {
  if (!Array.isArray(data)) return false;
  return data.every(h =>
    typeof h.id === 'string' &&
    typeof h.name === 'string' &&
    Array.isArray(h.logs) &&
    h.logs.every(validateLog)
  );
}

const { subscribe, update, set } = writable<Habit[]>([]);

load<Habit[]>().then(d => {
  if (d) set(d);
});

export const habits = {
  subscribe,
  add(name: string) {
    update(hs => {
      const next = [...hs, { id: uuid(), name, logs: [] }];
      save(next);
      return next;
    });
  },
  log(id: string) {
    const now = Date.now();
    update(hs => {
      const next = hs.map(h => {
        if (h.id !== id) return h;
        const last = h.logs[h.logs.length - 1];
        if (last && now - last.ts < 30000) return h;
        const diff = calcDiff(h.logs, now);
        return { ...h, logs: [...h.logs, { ts: now, diff }] };
      });
      save(next);
      return next;
    });
  },
  replace(data: Habit[]) {
    set(data);
    save(data);
  }
};
