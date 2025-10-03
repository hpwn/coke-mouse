<script lang="ts">
import { logs, formatDuration } from './store';
import { logsToCsv } from './csv';
import type { Habit } from './types';
import { DEFAULT_HABIT_STATUS, HABIT_STATUSES, type HabitStatus } from './habitStatus';
  import NegativeTimeline from './NegativeTimeline.svelte';

export let habit: Habit;
export let logHabit: (id: string) => void;
export let openEdit: (h: Habit) => void;
export let resetStreak: (id: string) => void;
export let openDelete: (id: string, name: string) => void;
export let setStatus: (id: string, status: HabitStatus) => void;

  let show = false;
  const panelId = `neg-tl-${habit.id}`;

  function sinceLast(): string {
    if (!habit.lastLoggedAt) return '—';
    const elapsed = (Date.now() - new Date(habit.lastLoggedAt).getTime()) / 1000;
    return formatDuration(elapsed);
    }

  function elapsed(): number {
    if (!habit.lastLoggedAt) return 0;
    const e = (Date.now() - new Date(habit.lastLoggedAt).getTime()) / 1000;
    return Math.min(e, habit.goalSeconds);
  }

  $: $logs;
  $: timeline = logs.getTimeline(habit.id);
  $: last = timeline[0];

  function exportCsv() {
    const rows = timeline.map(l => ({
      id: l.id,
      habitId: l.habitId,
      ts: new Date(l.at).getTime(),
      note: l.note ?? ''
    }));
    const csv = logsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const slug = habit.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fname = `cokemouse-negative-${slug}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
      d.getDate()
    )}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.csv`;
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  }

  $: currentStatus = habit.status ?? DEFAULT_HABIT_STATUS;

  function handleStatusChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value as HabitStatus;
    setStatus(habit.id, value);
  }

  function statusLabel(status: HabitStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
</script>

<div class="habit">
  <div class="habit-heading">
    <strong>{habit.name}</strong>
    <span class={`status-pill status-${currentStatus}`}>{statusLabel(currentStatus)}</span>
  </div>
  <label class="status-select">
    <span class="sr-only">Status</span>
    <select value={currentStatus} on:change={handleStatusChange}>
      {#each HABIT_STATUSES as status}
        <option value={status}>{statusLabel(status)}</option>
      {/each}
    </select>
  </label>
  {#if last && !show}
    <div>Last: {new Date(last.at).toLocaleString()}</div>
  {/if}
  <div>Since last: {sinceLast()}</div>
  <div>Goal: {formatDuration(habit.goalSeconds)}</div>
  <progress max={habit.goalSeconds} value={elapsed()}></progress>
  <div>Streak: {habit.streak}</div>
  <button on:click={() => logHabit(habit.id)}>Log</button>
  <button on:click={() => openEdit(habit)}>Edit Goal</button>
  <button on:click={() => resetStreak(habit.id)}>Reset Streak</button>
  <button on:click={() => openDelete(habit.id, habit.name)}>Delete</button>
  <button on:click={exportCsv}>Export CSV</button>
  <button aria-expanded={show} aria-controls={panelId} on:click={() => (show = !show)}>
    {show ? 'Hide timeline' : 'View timeline'}
  </button>
  {#if show}
    <div
      id={panelId}
      aria-label={`Timeline for ${habit.name}`}
      class="timeline"
    >
      <NegativeTimeline logs={timeline} />
    </div>
  {/if}
</div>

<style>
  .habit-heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .status-pill {
    font-size: 0.8rem;
    text-transform: capitalize;
    background: #e5e7eb;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
  }

  .status-pill.status-queued {
    background: #ede9fe;
    color: #5b21b6;
  }

  .status-pill.status-active {
    background: #dcfce7;
    color: #15803d;
  }

  .status-pill.status-paused {
    background: #fef3c7;
    color: #92400e;
  }

  .status-pill.status-archived {
    background: #f3f4f6;
    color: #374151;
  }

  .status-select {
    margin: 0.25rem 0 0.5rem;
    display: inline-block;
  }

  .status-select select {
    font-size: 0.85rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .timeline {
    max-height: 200px;
    overflow-y: auto;
  }
</style>
