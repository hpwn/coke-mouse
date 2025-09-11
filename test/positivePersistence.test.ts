import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));
const saveMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/persist', () => ({ load: async () => null, save: saveMock }));

import { positive } from '../src/lib/positive';
import { get } from 'svelte/store';

describe('positive persistence', () => {
  beforeEach(() => {
    positive.replace({ habits: [], logs: [] });
    saveMock.mockClear();
  });

  it('deleteHabit persists updated state', () => {
    vi.useFakeTimers();
    positive.add('a');
    const id = Object.keys(get(positive).habits)[0];
    positive.deleteHabit(id);
    vi.runAllTimers();
    expect(saveMock).toHaveBeenCalled();
    const saved = saveMock.mock.calls.pop()?.[0];
    expect(saved.habits[id]).toBeUndefined();
  });
});
