import { describe, it, expect, vi, beforeEach } from 'vitest';
import { habits } from '../src/lib/store';
import { positive } from '../src/lib/positive';
import { exportAll, importAll } from '../src/lib/exportImport';
import { get } from 'svelte/store';

vi.mock('../src/lib/persist', () => ({ load: async () => null, save: async () => {} }));

describe('export/import', () => {
  beforeEach(() => {
    habits.replace({ habits: [], logs: [] });
    positive.replace({ habits: [], logs: [] });
  });

  it('export includes positive', () => {
    positive.add('p');
    const data = exportAll();
    expect(data.positive.habits.length).toBe(1);
  });

  it('import v2 replaces positive cleanly', () => {
    positive.add('old');
    const payload = {
      version: 2,
      exportedAt: 0,
      negative: { habits: [], logs: [] },
      positive: {
        habits: [{ id: 'x', name: 'X', createdAt: 1 }],
        logs: [{ id: 'l', habitId: 'x', ts: 2, note: 'n' }]
      }
    };
    const ok = importAll(payload);
    expect(ok).toBe(true);
    const state = get(positive);
    expect(Object.keys(state.habits)).toEqual(['x']);
    expect(state.habitLogIndex['x'][0]).toBe('l');
  });

  it('import v1 leaves positive intact', () => {
    positive.add('keep');
    const before = get(positive);
    const ok = importAll({ version: 1, habits: [], logs: [] });
    expect(ok).toBe(true);
    expect(get(positive)).toEqual(before);
  });

  it('bad import does not mutate state', () => {
    positive.add('keep');
    const before = get(positive);
    const ok = importAll({ version: 2, negative: {}, positive: {} });
    expect(ok).toBe(false);
    expect(get(positive)).toEqual(before);
  });

  it('export includes habit statuses', () => {
    habits.add('neg');
    const neg = get(habits)[0];
    habits.setHabitStatus(neg.id, 'paused');
    positive.add('pos');
    const posId = Object.keys(get(positive).habits)[0];
    positive.setHabitStatus(posId, 'queued');
    const data = exportAll();
    expect(data.negative.habits[0].status).toBe('paused');
    expect(data.positive.habits[0].status).toBe('queued');
  });

  it('import defaults missing statuses to active', () => {
    const payload = {
      version: 2,
      exportedAt: 0,
      negative: {
        habits: [{ id: 'n', name: 'neg', createdAt: '2023-01-01T00:00:00Z', goalSeconds: 86400, streak: 0 }],
        logs: []
      },
      positive: {
        habits: [{ id: 'p', name: 'pos', createdAt: 1 }],
        logs: []
      }
    };
    const ok = importAll(payload);
    expect(ok).toBe(true);
    expect(get(habits)[0].status).toBe('active');
    const posState = get(positive);
    expect(posState.habits['p'].status).toBe('active');
  });
});
