<script lang="ts">
import { habits, logs, formatDuration, validate } from '../lib/store';
import { get } from 'svelte/store';
import type { Habit } from '../lib/types';

let name = '';
let editing: Habit | null = null;
let goalHours = 0;
let goalMinutes = 0;
let dialog: HTMLDialogElement;

function addHabit() {
  if (name.trim()) {
    habits.add(name.trim());
    name = '';
  }
}

function logHabit(id: string) {
  habits.log(id);
}

function openEdit(h: Habit) {
  editing = h;
  goalHours = Math.floor(h.goalSeconds / 3600);
  goalMinutes = Math.floor((h.goalSeconds % 3600) / 60);
  dialog.showModal();
}

function saveGoal() {
  if (!editing) return;
  const secs = goalHours * 3600 + goalMinutes * 60;
  habits.editGoal(editing.id, secs);
  dialog.close();
}

function resetStreak(id: string) {
  habits.resetStreak(id);
}

function exportJson() {
  const data = JSON.stringify({ habits: get(habits), logs: get(logs) }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'habits.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importJson(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string);
      if (validate(data)) habits.replace(data);
    } catch (err) {
      console.error('Invalid JSON');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function sinceLast(h: Habit): string {
  if (!h.lastLoggedAt) return '—';
  const elapsed = (Date.now() - new Date(h.lastLoggedAt).getTime()) / 1000;
  return formatDuration(elapsed);
}

function elapsed(h: Habit): number {
  if (!h.lastLoggedAt) return 0;
  const e = (Date.now() - new Date(h.lastLoggedAt).getTime()) / 1000;
  return Math.min(e, h.goalSeconds);
}
</script>

<dialog bind:this={dialog}>
  <form on:submit|preventDefault={saveGoal}>
    <label>Goal:
      <input type="number" min="0" bind:value={goalHours} />h
      <input type="number" min="0" max="59" bind:value={goalMinutes} />m
    </label>
    <button type="submit">Save</button>
  </form>
</dialog>

<div class="controls">
  <button on:click={exportJson}>Export JSON</button>
  <input type="file" accept="application/json" on:change={importJson} />
</div>

<form on:submit|preventDefault={addHabit}>
  <input bind:value={name} placeholder="New habit" />
  <button type="submit">Add</button>
</form>

{#each $habits as habit (habit.id)}
  <div class="habit">
    <strong>{habit.name}</strong>
    <div>Since last: {sinceLast(habit)}</div>
    <div>Goal: {formatDuration(habit.goalSeconds)}</div>
    <progress max={habit.goalSeconds} value={elapsed(habit)}></progress>
    <div>Streak: {habit.streak}</div>
    <button on:click={() => logHabit(habit.id)}>Log</button>
    <button on:click={() => openEdit(habit)}>Edit Goal</button>
    <button on:click={() => resetStreak(habit.id)}>Reset Streak</button>
  </div>
{/each}

<style>
form { margin-bottom: 1rem; }
.controls { margin-bottom: 1rem; }
.habit { margin-top: 1rem; }
progress { width: 100%; }
</style>
