import { describe, it, expect, beforeEach, vi } from 'vitest';
import { positive } from '../src/lib/positive';
import { get } from 'svelte/store';

vi.mock('../src/lib/persist', () => ({ load: async () => null, save: vi.fn() }));

describe('positive store log actions', () => {
  beforeEach(() => {
    positive.replace({ habits: [], logs: [] });
    vi.useFakeTimers();
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
