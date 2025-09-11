import { describe, it, expect, vi, beforeEach } from 'vitest';
import { positive } from '../src/lib/positive';
import { get } from 'svelte/store';

vi.mock('../src/lib/persist', () => ({ load: async () => null, save: async () => {} }));

describe('positive store', () => {
  beforeEach(() => {
    positive.replace({ habits: [], logs: [] });
    vi.useRealTimers();
  });

  it('initializes empty state', () => {
    const state = get(positive);
    expect(state).toEqual({ habits: {}, logs: {}, habitLogIndex: {}, version: 1 });
  });

  it('createHabit adds habit with name + createdAt', () => {
    positive.add('test');
    const state = get(positive);
    const habit = Object.values(state.habits)[0];
    expect(habit.name).toBe('test');
    expect(typeof habit.createdAt).toBe('number');
  });

  it('logSuccess inserts log with epoch ms and note', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    positive.add('a');
    const id = Object.keys(get(positive).habits)[0];
    positive.log(id, 'done');
    const state = get(positive);
    const logId = state.habitLogIndex[id][0];
    expect(state.logs[logId]).toMatchObject({ habitId: id, ts: 1000, note: 'done' });
  });

  it('timeline is newest-first', () => {
    vi.useFakeTimers();
    positive.add('a');
    const id = Object.keys(get(positive).habits)[0];
    vi.setSystemTime(0);
    positive.log(id, 'first');
    vi.setSystemTime(1000);
    positive.log(id, 'second');
    const logs = positive.getLogs(id);
    expect(logs[0].note).toBe('second');
    expect(logs[1].note).toBe('first');
  });
});
