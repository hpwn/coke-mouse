import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NegativeHabitItem from '../src/lib/NegativeHabitItem.svelte';
import NegativeTimeline from '../src/lib/NegativeTimeline.svelte';
import { habits } from '../src/lib/store';
import { get } from 'svelte/store';

const saveMock = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/persist', () => ({ load: async () => null, save: saveMock }));

function noop() {}

describe('Negative timeline components', () => {
  beforeEach(() => {
    habits.replace({ habits: [], logs: [] });
    saveMock.mockClear();
    vi.useFakeTimers();
  });

  it('toggle button shows timeline and updates aria attributes', async () => {
    habits.add('a');
    const habit = get(habits)[0];
    habits.log(habit.id);
    const { getByRole, queryByLabelText } = render(NegativeHabitItem, {
      props: {
        habit,
        logHabit: noop,
        openEdit: noop,
        resetStreak: noop,
        openDelete: noop
      }
    });
    const btn = getByRole('button', { name: 'View timeline' });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(queryByLabelText(`Timeline for ${habit.name}`)).toBeTruthy();
  });

  it('NegativeTimeline shows empty state', () => {
    const { getByText } = render(NegativeTimeline, { props: { logs: [] } });
    getByText('No logs yet.');
  });

  it('NegativeTimeline renders timestamp and note', () => {
    const at = new Date('2025-09-10T21:43:00Z').toISOString();
    const note = 'oops';
    const { getByText } = render(NegativeTimeline, {
      props: { logs: [{ id: '1', habitId: 'h', at, note }] }
    });
    const ts = new Date(at).toLocaleString();
    getByText(`${ts} — ${note}`);
  });
});
