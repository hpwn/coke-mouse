import { describe, it, expect, vi, beforeEach } from 'vitest';
import { habits } from '../src/lib/store';
import { get } from 'svelte/store';

vi.mock('../src/lib/persist', () => ({ load: async () => null, save: async () => {} }));

describe('goals and streaks', () => {
  beforeEach(() => {
    habits.replace({ habits: [], logs: [] });
    vi.useFakeTimers();
  });

  it('hit increases goal and streak, miss decreases goal and resets streak', () => {
    habits.add('test');
    const id = get(habits)[0].id;
    habits.editGoal(id, 3600);
    vi.setSystemTime(0);
    habits.log(id);
    vi.setSystemTime(2 * 3600 * 1000);
    habits.log(id);
    let h = get(habits)[0];
    expect(h.streak).toBe(1);
    expect(h.goalSeconds).toBe(3960);

    vi.setSystemTime(2 * 3600 * 1000 + 1800 * 1000);
    habits.log(id);
    h = get(habits)[0];
    expect(h.streak).toBe(0);
    expect(h.goalSeconds).toBe(3600);
  });

  it('rounds and clamps goalSeconds', () => {
    habits.add('test');
    const id = get(habits)[0].id;
    habits.editGoal(id, 4001);
    vi.setSystemTime(0);
    habits.log(id);
    vi.setSystemTime(5000 * 1000);
    habits.log(id);
    let h = get(habits)[0];
    expect(h.goalSeconds).toBe(4401);

    habits.editGoal(id, 2592000);
    vi.setSystemTime(5000 * 1000 + 2592000 * 1000);
    habits.log(id);
    h = get(habits)[0];
    expect(h.goalSeconds).toBe(2592000);

    habits.editGoal(id, 3600);
    vi.setSystemTime(5000 * 1000 + 2592000 * 1000 + 3600 * 1000);
    habits.log(id);
    vi.setSystemTime(5000 * 1000 + 2592000 * 1000 + 3600 * 1000 + 1800 * 1000);
    habits.log(id);
    h = get(habits)[0];
    expect(h.goalSeconds).toBe(3600);
  });
});
