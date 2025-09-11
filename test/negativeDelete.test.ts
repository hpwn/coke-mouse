import { describe, it, expect, vi, beforeEach } from 'vitest';
import { habits, logs } from '../src/lib/store';
import { get } from 'svelte/store';

const saveMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/persist', () => ({ load: async () => null, save: saveMock }));

describe('negative store deleteHabit', () => {
  beforeEach(() => {
    habits.replace({ habits: [], logs: [] });
    saveMock.mockClear();
  });

  it('deleteHabit removes habit', () => {
    habits.add('a');
    const id = get(habits)[0].id;
    habits.deleteHabit(id);
    expect(get(habits).find(h => h.id === id)).toBeUndefined();
  });

  it('deleteHabit removes associated logs', () => {
    habits.add('a');
    const id = get(habits)[0].id;
    logs.subscribe(() => {}); // ensure subscription? not necessary
    habits.log(id);
    habits.deleteHabit(id);
    expect(get(logs).some(l => l.habitId === id)).toBe(false);
  });

  it('deleteHabit leaves other habits/logs untouched', () => {
    habits.add('a');
    habits.add('b');
    const ids = get(habits).map(h => h.id);
    habits.log(ids[0]);
    habits.log(ids[1]);
    habits.deleteHabit(ids[0]);
    expect(get(habits).find(h => h.id === ids[1])).toBeDefined();
    expect(get(logs).some(l => l.habitId === ids[1])).toBe(true);
  });

  it('deleteHabit persists updated state', () => {
    habits.add('a');
    const id = get(habits)[0].id;
    habits.deleteHabit(id);
    expect(saveMock).toHaveBeenCalled();
    const saved = saveMock.mock.calls.pop()?.[0];
    expect(saved.habits.find((h: any) => h.id === id)).toBeUndefined();
  });
});
