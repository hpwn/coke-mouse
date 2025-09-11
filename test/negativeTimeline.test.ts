import { describe, it, expect, vi, beforeEach } from 'vitest';
import { habits, logs } from '../src/lib/store';
import { get } from 'svelte/store';

const saveMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/persist', () => ({ load: async () => null, save: saveMock }));

describe('negative timeline selector', () => {
  beforeEach(() => {
    habits.replace({ habits: [], logs: [] });
    saveMock.mockClear();
    vi.useFakeTimers();
  });

  it('getTimeline returns newest-first', () => {
    habits.add('a');
    const id = get(habits)[0].id;
    vi.setSystemTime(0);
    habits.log(id);
    vi.setSystemTime(31000);
    habits.log(id);
    const timeline = logs.getTimeline(id);
    expect(new Date(timeline[0].at).getTime()).toBe(31000);
    expect(new Date(timeline[1].at).getTime()).toBe(0);
  });

  it('getTimeline handles habits with no logs', () => {
    habits.add('a');
    const id = get(habits)[0].id;
    const timeline = logs.getTimeline(id);
    expect(timeline).toEqual([]);
  });
});
