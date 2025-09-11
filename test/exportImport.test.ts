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
});
