<script lang="ts">
import { habits, formatDuration } from '../lib/store';
import { positive } from '../lib/positive';
import { exportAll, importAll } from '../lib/exportImport';
import type { Habit } from '../lib/types';
import { browser } from '$app/environment';

let tab: 'positive' | 'negative' = 'negative';
if (browser) {
  const saved = localStorage.getItem('cm:lastTab');
  if (saved === 'positive' || saved === 'negative') tab = saved;
}
function switchTab(t: 'positive' | 'negative') {
  tab = t;
  if (browser) localStorage.setItem('cm:lastTab', t);
}

// negative vars
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

// positive vars
let pName = '';
let logDialog: HTMLDialogElement;
let logging: { id: string; name: string } | null = null;
let note = '';
const show: Record<string, boolean> = {};

function addPositive() {
  if (pName.trim()) {
    positive.add(pName.trim());
    pName = '';
  }
}

function openLog(h: { id: string; name: string }) {
  logging = h;
  logDialog.showModal();
}

function saveLog() {
  if (logging) positive.log(logging.id, note.trim());
  note = '';
  logDialog.close();
  logging = null;
}

function cancelLog() {
  note = '';
  logDialog.close();
  logging = null;
}

function toggleTimeline(id: string) {
  show[id] = !show[id];
}

// export / import
function exportJson() {
  const data = JSON.stringify(exportAll(), null, 2);
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
      if (!importAll(data)) console.error('Invalid JSON');
    } catch (err) {
      console.error('Invalid JSON');
    }
  };
  reader.readAsText(file);
  input.value = '';
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

<dialog bind:this={logDialog} on:close={cancelLog}>
  <form on:submit|preventDefault={saveLog}>
    <label>Note:
      <textarea bind:value={note}></textarea>
    </label>
    <menu>
      <button type="submit">Save</button>
      <button type="button" on:click={cancelLog}>Cancel</button>
    </menu>
  </form>
</dialog>

<div class="controls">
  <button on:click={exportJson}>Export JSON</button>
  <input type="file" accept="application/json" on:change={importJson} />
</div>

<div role="tablist" class="tabs">
  <button role="tab" aria-selected={tab === 'positive'} aria-controls="positive-panel" on:click={() => switchTab('positive')}>Positive</button>
  <button role="tab" aria-selected={tab === 'negative'} aria-controls="negative-panel" on:click={() => switchTab('negative')}>Negative</button>
</div>

{#if tab === 'positive'}
  <div id="positive-panel" role="tabpanel">
    <form on:submit|preventDefault={addPositive}>
      <input bind:value={pName} placeholder="New habit" />
      <button type="submit">Add</button>
    </form>
    {#each Object.values($positive.habits) as habit (habit.id)}
      <div class="habit">
        <strong>{habit.name}</strong>
        <button on:click={() => openLog(habit)}>Log</button>
        <button on:click={() => toggleTimeline(habit.id)}>{show[habit.id] ? 'Hide' : 'Show'} timeline</button>
        {#if show[habit.id]}
          <ul>
            {#each positive.getLogs(habit.id) as l (l.id)}
              <li>{new Date(l.ts).toLocaleString()}: {l.note}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <div id="negative-panel" role="tabpanel">
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
  </div>
{/if}

<style>
form { margin-bottom: 1rem; }
.controls { margin-bottom: 1rem; }
.habit { margin-top: 1rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
[role="tab"][aria-selected="true"] { font-weight: bold; }
progress { width: 100%; }
</style>
