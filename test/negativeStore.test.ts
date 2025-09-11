import { describe, it, expect, beforeEach, vi } from 'vitest';
import { habits, logs } from '../src/lib/store';
import { get } from 'svelte/store';

const saveMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/persist', () => ({ load: async () => null, save: saveMock }));

describe('negative store log actions', () => {
  beforeEach(() => {
    habits.replace({ habits: [], logs: [] });
    saveMock.mockClear();
    vi.useFakeTimers();
  });

  it('editLog updates note', () => {
    habits.add('a');
    const habit = get(habits)[0];
    habits.log(habit.id);
    const log = logs.getTimeline(habit.id)[0];
    logs.editLog(log.id, 'hi');
    expect(logs.getTimeline(habit.id)[0].note).toBe('hi');
  });

  it('deleteLog removes and updates lastLoggedAt', () => {
    habits.add('a');
    const habit = get(habits)[0];
    habits.log(habit.id);
    vi.setSystemTime(new Date(Date.now() + 60000));
    habits.log(habit.id);
    let timeline = logs.getTimeline(habit.id);
    expect(timeline.length).toBe(2);
    const latest = timeline[0];
    const prev = timeline[1];
    logs.deleteLog(latest.id);
    timeline = logs.getTimeline(habit.id);
    expect(timeline.length).toBe(1);
    expect(get(habits)[0].lastLoggedAt).toBe(prev.at);
  });
});
