import { describe, it, expect, vi, beforeEach } from 'vitest';
import { positive } from '../src/lib/positive';
import { get } from 'svelte/store';

const saveMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/persist', () => ({ load: async () => null, save: saveMock }));

describe('positive store', () => {
  beforeEach(() => {
    positive.replace({ habits: [], logs: [] });
    vi.useRealTimers();
    saveMock.mockClear();
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

  it('deleteHabit removes habit', () => {
    positive.add('a');
    const id = Object.keys(get(positive).habits)[0];
    positive.deleteHabit(id);
    expect(get(positive).habits[id]).toBeUndefined();
  });

  it('deleteHabit removes all associated logs', () => {
    vi.useFakeTimers();
    positive.add('a');
    const id = Object.keys(get(positive).habits)[0];
    positive.log(id, 'note');
    positive.deleteHabit(id);
    vi.runAllTimers();
    const state = get(positive);
    expect(Object.values(state.logs).some(l => l.habitId === id)).toBe(false);
    expect(state.habitLogIndex[id]).toBeUndefined();
  });

  it('deleteHabit leaves other habits/logs untouched', () => {
    vi.useFakeTimers();
    positive.add('a');
    positive.add('b');
    const ids = Object.keys(get(positive).habits);
    positive.log(ids[0], 'n1');
    positive.log(ids[1], 'n2');
    positive.deleteHabit(ids[0]);
    vi.runAllTimers();
    const state = get(positive);
    expect(state.habits[ids[1]]).toBeDefined();
    expect(Object.values(state.logs).some(l => l.habitId === ids[1])).toBe(true);
  });

});
