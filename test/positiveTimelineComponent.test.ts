import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tick } from 'svelte';
import PositiveTimeline from '../src/lib/PositiveTimeline.svelte';
import { positive } from '../src/lib/positive';
import { get } from 'svelte/store';

vi.mock('../src/lib/persist', () => ({ load: async () => null, save: vi.fn() }));

describe('PositiveTimeline component', () => {
  beforeEach(() => {
    positive.replace({ habits: [], logs: [] });
    vi.useFakeTimers();
  });

  it('groups by date and allows edit', async () => {
    positive.add('h');
    const id = Object.keys(get(positive).habits)[0];
    vi.setSystemTime(new Date('2024-06-02T10:00:00Z'));
    positive.log(id, 'today');
    const todayId = get(positive).habitLogIndex[id][0];
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    positive.log(id, 'yesterday');
    vi.setSystemTime(new Date('2024-06-02T12:00:00Z'));
    const { getByText, getAllByLabelText } = render(PositiveTimeline, {
      props: { habitId: id }
    });
    getByText('Today');
    getByText('Yesterday');
    const [editBtn] = getAllByLabelText('Edit log');
    await fireEvent.click(editBtn);
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'edited' } });
    await fireEvent.click(getByText('Save'));
    await tick();
    const updated = positive.getLogs(id).find(l => l.id === todayId);
    expect(updated?.note).toBe('edited');
  });
});
