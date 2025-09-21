<script lang="ts">
import { habits, formatDuration } from '../lib/store';
import {
  positive,
  type PositiveHabit as PositiveHabitModel,
  type PositiveHabitLog,
  type PositiveState
} from '../lib/positive';
import { exportAll, importAll } from '../lib/exportImport';
import type { Habit } from '../lib/types';
import { browser } from '$app/environment';
import ConfirmDeleteHabitDialog from '../lib/ConfirmDeleteHabitDialog.svelte';
import NegativeHabitItem from '../lib/NegativeHabitItem.svelte';
import PositiveTimeline from '../lib/PositiveTimeline.svelte';
import { logsToCsv } from '../lib/csv';
import {
  buildTimeOfDayMetric,
  clampWrapHour,
  denormalizeByWrap,
  normalizeByWrap,
  isBetterTimeOfDay,
  type TimeOfDayMetric
} from '../lib/metric';

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
let pMetricEnabled = false;
let pMetricWrapHour = 18;
let pMetricLowerIsBetter = true;
let logDialog: HTMLDialogElement;
let logging: PositiveHabitModel | null = null;
let logMode: 'note' | 'metric-now' | 'metric-manual' = 'note';
let pendingMetricDate: Date | null = null;
let manualDate = '';
let manualTime = '';
let note = '';
let logError = '';
const show: Record<string, boolean> = {};

// delete vars
let deleteDialog: ConfirmDeleteHabitDialog;
let toDelete: { type: 'positive' | 'negative'; id: string; name: string } | null = null;
let lastFocused: HTMLElement | null = null;
let toast = '';
let toastTimer: any;

const pad = (n: number) => String(n).padStart(2, '0');
const toDateInputValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInputValue = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function parseManual(): Date | null {
  if (!manualDate || !manualTime) return null;
  const [y, m, d] = manualDate.split('-').map(Number);
  const [hh, mm] = manualTime.split(':').map(Number);
  if ([y, m, d, hh, mm].some(n => Number.isNaN(n))) return null;
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

function addPositive() {
  if (!pName.trim()) return;
  const metricConfig = pMetricEnabled
    ? {
        kind: 'timeOfDay' as const,
        wrapHour: clampWrapHour(pMetricWrapHour) ?? 18,
        lowerIsBetter: pMetricLowerIsBetter
      }
    : undefined;
  positive.add(pName.trim(), metricConfig);
  pName = '';
  pMetricEnabled = false;
  pMetricWrapHour = 18;
  pMetricLowerIsBetter = true;
}

function openLogNote(habit: PositiveHabitModel) {
  logging = habit;
  logMode = 'note';
  pendingMetricDate = null;
  manualDate = '';
  manualTime = '';
  note = '';
  logError = '';
  logDialog.showModal();
}

function openLogNow(habit: PositiveHabitModel) {
  logging = habit;
  logMode = 'metric-now';
  pendingMetricDate = new Date();
  manualDate = toDateInputValue(pendingMetricDate);
  manualTime = toTimeInputValue(pendingMetricDate);
  note = '';
  logError = '';
  logDialog.showModal();
}

function openLogTime(habit: PositiveHabitModel) {
  logging = habit;
  logMode = 'metric-manual';
  const base = new Date();
  manualDate = toDateInputValue(base);
  manualTime = toTimeInputValue(base);
  pendingMetricDate = null;
  note = '';
  logError = '';
  logDialog.showModal();
}

function saveLog() {
  if (!logging) return;
  const text = note.trim();
  if (logMode === 'metric-now' && logging.metric?.kind === 'timeOfDay') {
    const date = pendingMetricDate ?? new Date();
    const metric = buildTimeOfDayMetric(date, logging.metric);
    positive.log(logging.id, text, { metric, ts: date.getTime() });
  } else if (logMode === 'metric-manual' && logging.metric?.kind === 'timeOfDay') {
    const manual = parseManual();
    if (!manual) {
      logError = 'Choose a valid date and time.';
      return;
    }
    const metric = buildTimeOfDayMetric(manual, logging.metric);
    positive.log(logging.id, text, { metric, ts: manual.getTime() });
  } else {
    positive.log(logging.id, text);
  }
  note = '';
  logError = '';
  pendingMetricDate = null;
  manualDate = '';
  manualTime = '';
  logMode = 'note';
  logDialog.close();
  logging = null;
}

function cancelLog() {
  note = '';
  logError = '';
  pendingMetricDate = null;
  manualDate = '';
  manualTime = '';
  logDialog.close();
  logging = null;
  logMode = 'note';
}

function toggleTimeline(id: string) {
  show[id] = !show[id];
}

function exportPositiveCsv(habit: PositiveHabitModel) {
  const logs = positive.getLogs(habit.id).map(l => ({
    id: l.id,
    habitId: l.habitId,
    ts: l.ts,
    note: l.note,
    metric: l.metric
  }));
  const csv = logsToCsv(logs);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const slug = habit.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const fname = `cokemouse-positive-${slug}_${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(
    d.getDate()
  )}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}.csv`;
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  a.click();
  URL.revokeObjectURL(url);
}

function toggleHabitMetric(habit: PositiveHabitModel, enabled: boolean) {
  if (enabled) {
    positive.setMetric(habit.id, {
      kind: 'timeOfDay',
      wrapHour: habit.metric?.wrapHour ?? 18,
      lowerIsBetter: habit.metric?.lowerIsBetter ?? true
    });
  } else {
    positive.setMetric(habit.id, undefined);
  }
}

function updateHabitWrap(habit: PositiveHabitModel, value: number) {
  const safe = clampWrapHour(Number.isFinite(value) ? value : undefined) ?? 18;
  positive.setMetric(habit.id, {
    kind: 'timeOfDay',
    wrapHour: safe,
    lowerIsBetter: habit.metric?.lowerIsBetter ?? true
  });
}

function updateHabitDirection(habit: PositiveHabitModel, lower: boolean) {
  positive.setMetric(habit.id, {
    kind: 'timeOfDay',
    wrapHour: habit.metric?.wrapHour ?? 18,
    lowerIsBetter: lower
  });
}

function handleMetricToggle(event: Event, habit: PositiveHabitModel) {
  const input = event.currentTarget as HTMLInputElement;
  toggleHabitMetric(habit, input.checked);
}

function handleWrapChange(event: Event, habit: PositiveHabitModel) {
  const input = event.currentTarget as HTMLInputElement;
  updateHabitWrap(habit, input.valueAsNumber);
}

function handleDirectionChange(event: Event, habit: PositiveHabitModel) {
  const input = event.currentTarget as HTMLInputElement;
  updateHabitDirection(habit, input.checked);
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

interface MetricSummary {
  last?: TimeOfDayMetric;
  best7d?: TimeOfDayMetric;
  target?: TimeOfDayMetric;
}

$: positiveState = $positive as PositiveState;
$: metricSummaries = buildMetricSummaries(positiveState);
$: manualPreview =
  logging?.metric?.kind === 'timeOfDay' && logMode === 'metric-manual'
    ? (() => {
        const parsed = parseManual();
        return parsed && logging ? buildTimeOfDayMetric(parsed, logging.metric).display : '';
      })()
    : '';

function buildMetricSummaries(state: PositiveState): Record<string, MetricSummary> {
  const result: Record<string, MetricSummary> = {};
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  for (const habit of Object.values(state.habits)) {
    if (habit.metric?.kind !== 'timeOfDay') continue;
    const ids = state.habitLogIndex[habit.id] ?? [];
    const logs = ids
      .map(id => state.logs[id])
      .filter(
        (log): log is PositiveHabitLog & { metric: TimeOfDayMetric } =>
          Boolean(log && log.metric?.kind === 'timeOfDay')
      );
    if (!logs.length) {
      result[habit.id] = {};
      continue;
    }
    const summary: MetricSummary = {};
    summary.last = logs[0].metric;
    const recent = logs.filter(log => log.ts >= sevenDaysAgo);
    if (recent.length) {
      let best = recent[0];
      for (const entry of recent.slice(1)) {
        if (isBetterTimeOfDay(entry.metric, best.metric, habit.metric)) {
          best = entry;
        }
      }
      summary.best7d = best.metric;
    }
    const wrapHour = habit.metric.wrapHour ?? 18;
    const minTargetMinutes = ((wrapHour + 23) % 24) * 60;
    const minTargetNormalized = normalizeByWrap(minTargetMinutes, wrapHour);
    let targetNormalized = summary.last.normalizedMinutes - 5;
    if (targetNormalized < minTargetNormalized) targetNormalized = minTargetNormalized;
    const targetMinutes = denormalizeByWrap(targetNormalized, wrapHour);
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setMinutes(targetMinutes);
    summary.target = buildTimeOfDayMetric(targetDate, habit.metric);
    result[habit.id] = summary;
  }
  return result;
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
    {#if logging?.metric?.kind === 'timeOfDay'}
      {#if logMode === 'metric-now'}
        <p class="metric-preview">Logging time: <strong>{buildTimeOfDayMetric(pendingMetricDate ?? new Date(), logging.metric).display}</strong></p>
      {:else if logMode === 'metric-manual'}
        <div class="metric-manual">
          <label>Time
            <input type="time" bind:value={manualTime} required on:input={() => (logError = '')} />
          </label>
          <label>Date
            <input type="date" bind:value={manualDate} required on:input={() => (logError = '')} />
          </label>
        </div>
        {#if manualPreview}
          <p class="metric-preview">Preview: {manualPreview}</p>
        {/if}
      {/if}
    {/if}
    <label>Note:
      <textarea bind:value={note}></textarea>
    </label>
    {#if logError}
      <p class="error">{logError}</p>
    {/if}
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
    <form on:submit|preventDefault={addPositive} class="positive-form">
      <input bind:value={pName} placeholder="New habit" />
      <label class="metric-toggle">
        <input type="checkbox" bind:checked={pMetricEnabled} /> Track bedtime (Time of Day)
      </label>
      {#if pMetricEnabled}
        <div class="metric-settings">
          <label>Wrap hour
            <input type="number" min="0" max="23" bind:value={pMetricWrapHour} />
          </label>
          <label>
            <input type="checkbox" bind:checked={pMetricLowerIsBetter} /> Earlier is better
          </label>
        </div>
      {/if}
      <button type="submit">Add</button>
    </form>
    {#each Object.values($positive.habits) as habit (habit.id)}
      <div class="habit">
        <div class="habit-header">
          <strong>{habit.name}</strong>
          <div class="habit-actions">
            {#if habit.metric?.kind === 'timeOfDay'}
              <button on:click={() => openLogNow(habit)}>Log Now</button>
              <button on:click={() => openLogTime(habit)}>Log Time…</button>
            {:else}
              <button on:click={() => openLogNote(habit)}>Log</button>
            {/if}
            <button on:click={() => exportPositiveCsv(habit)}>Export CSV</button>
            <button on:click={() => openDelete('positive', habit.id, habit.name)}>Delete</button>
            <button on:click={() => toggleTimeline(habit.id)}>{show[habit.id] ? 'Hide' : 'Show'} timeline</button>
          </div>
        </div>
        <div class="metric-config">
          <label>
            <input
              type="checkbox"
              checked={habit.metric?.kind === 'timeOfDay'}
              on:change={event => handleMetricToggle(event, habit)}
            />
            Track bedtime metric
          </label>
          {#if habit.metric?.kind === 'timeOfDay'}
            <div class="metric-settings">
              <label>Wrap hour
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={habit.metric?.wrapHour ?? 18}
                  on:change={event => handleWrapChange(event, habit)}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={habit.metric?.lowerIsBetter ?? true}
                  on:change={event => handleDirectionChange(event, habit)}
                />
                Earlier is better
              </label>
            </div>
            <div class="metric-summary">
              <span>Last: {metricSummaries[habit.id]?.last?.display ?? '—'}</span>
              <span>Best (7d): {metricSummaries[habit.id]?.best7d?.display ?? '—'}</span>
              <span>Tonight’s target: {metricSummaries[habit.id]?.target?.display ?? '—'}</span>
            </div>
          {/if}
        </div>
        {#if show[habit.id]}
          <PositiveTimeline habitId={habit.id} />
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
.habit { margin-top: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
.habit-header { display: flex; flex-direction: column; gap: 0.5rem; }
.habit-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.metric-config { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.metric-settings { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.metric-summary { display: flex; gap: 0.75rem; flex-wrap: wrap; font-size: 0.9em; }
.metric-summary span { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 999px; }
.metric-toggle { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; }
.metric-manual { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.metric-preview { margin: 0.25rem 0 0.5rem; font-size: 0.9em; color: #4b5563; }
.error { color: #b91c1c; margin: 0.5rem 0; }
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
