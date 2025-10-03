import { describe, it, expect, beforeEach, vi } from 'vitest';
import { positive } from '../src/lib/positive';
import { get } from 'svelte/store';

vi.mock('../src/lib/persist', () => ({ load: async () => null, save: vi.fn() }));

describe('positive store log actions', () => {
  beforeEach(() => {
    positive.replace({ habits: [], logs: [] });
    vi.useFakeTimers();
  });

  it('quickAddQueuedHabit creates queued habit', () => {
    positive.quickAddQueuedHabit('queued');
    const state = get(positive);
    const habit = Object.values(state.habits)[0];
    expect(habit.status).toBe('queued');
  });

  it('setHabitStatus persists through replace', () => {
    positive.add('persist');
    const id = Object.keys(get(positive).habits)[0];
    positive.setHabitStatus(id, 'paused');
    const snapshot = get(positive);
    positive.replace({
      habits: Object.values(snapshot.habits).map(h => ({ ...h })),
      logs: Object.values(snapshot.logs).map(l => ({ ...l }))
    });
    expect(get(positive).habits[id].status).toBe('paused');
  });

  it('editLog updates note and persists', () => {
    positive.add('h');
    const id = Object.keys(get(positive).habits)[0];
    positive.log(id, 'a');
    const logId = get(positive).habitLogIndex[id][0];
    positive.editLog(logId, 'b');
    expect(get(positive).logs[logId].note).toBe('b');
  });

  it('deleteLog removes log and index', () => {
    positive.add('h');
    const id = Object.keys(get(positive).habits)[0];
    positive.log(id, 'a');
    const logId = get(positive).habitLogIndex[id][0];
    positive.deleteLog(logId);
    const state = get(positive);
    expect(state.logs[logId]).toBeUndefined();
    expect(state.habitLogIndex[id]).toEqual([]);
  });
});
