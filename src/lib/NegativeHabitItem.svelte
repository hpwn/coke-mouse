<script lang="ts">
  import { logs, formatDuration } from './store';
  import { logsToCsv } from './csv';
  import type { Habit } from './types';
  import NegativeTimeline from './NegativeTimeline.svelte';

  export let habit: Habit;
  export let logHabit: (id: string) => void;
  export let openEdit: (h: Habit) => void;
  export let resetStreak: (id: string) => void;
  export let openDelete: (id: string, name: string) => void;

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
</script>

<div class="habit">
  <strong>{habit.name}</strong>
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
  .timeline {
    max-height: 200px;
    overflow-y: auto;
  }
</style>
