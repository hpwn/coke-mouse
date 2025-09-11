<script lang="ts">
import { habits, formatDuration } from '../lib/store';
import { positive } from '../lib/positive';
import { exportAll, importAll } from '../lib/exportImport';
import type { Habit } from '../lib/types';
import { browser } from '$app/environment';
import ConfirmDeleteHabitDialog from '../lib/ConfirmDeleteHabitDialog.svelte';
import NegativeHabitItem from '../lib/NegativeHabitItem.svelte';

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

// positive vars
let pName = '';
let logDialog: HTMLDialogElement;
let logging: { id: string; name: string } | null = null;
let note = '';
const show: Record<string, boolean> = {};

// delete vars
let deleteDialog: ConfirmDeleteHabitDialog;
let toDelete: { type: 'positive' | 'negative'; id: string; name: string } | null = null;
let lastFocused: HTMLElement | null = null;
let toast = '';
let toastTimer: any;

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

function openDelete(type: 'positive' | 'negative', id: string, name: string) {
  toDelete = { type, id, name };
  lastFocused = document.activeElement as HTMLElement;
  deleteDialog.open();
}

function cancelDelete() {
  deleteDialog.close();
  toDelete = null;
  lastFocused?.focus();
}

function confirmDelete() {
  if (!toDelete) return;
  if (toDelete.type === 'positive') {
    positive.deleteHabit(toDelete.id);
    show[toDelete.id] = false;
  } else {
    habits.deleteHabit(toDelete.id);
  }
  toast = `Deleted '${toDelete.name}'`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast = ''), 3000);
  deleteDialog.close();
  toDelete = null;
  lastFocused?.focus();
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

<ConfirmDeleteHabitDialog
  bind:this={deleteDialog}
  habitName={toDelete?.name ?? ''}
  on:cancel={cancelDelete}
  on:confirm={confirmDelete}
/>

<div class="controls">
  <button on:click={exportJson}>Export JSON</button>
  <input type="file" accept="application/json" on:change={importJson} />
</div>

{#if toast}
  <div class="toast" role="status">{toast}</div>
{/if}

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
        <button on:click={() => openDelete('positive', habit.id, habit.name)}>Delete</button>
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
      <NegativeHabitItem
        {habit}
        {logHabit}
        {openEdit}
        {resetStreak}
        openDelete={(id, name) => openDelete('negative', id, name)}
      />
    {/each}
  </div>
{/if}

<style>
form { margin-bottom: 1rem; }
.controls { margin-bottom: 1rem; }
.habit { margin-top: 1rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
[role="tab"][aria-selected="true"] { font-weight: bold; }
.toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
</style>
