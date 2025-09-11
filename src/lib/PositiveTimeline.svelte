<script lang="ts">
  import { positive, type PositiveHabitLog } from './positive';
  import EditLogDialog from './EditLogDialog.svelte';
  import ConfirmDeleteLogDialog from './ConfirmDeleteLogDialog.svelte';
  import { isToday, isYesterday, yyyyMmDd } from './date';

  export let habitId: string;

  let editDialog: EditLogDialog;
  let deleteDialog: ConfirmDeleteLogDialog;
  let editing: PositiveHabitLog | null = null;
  let deleting: PositiveHabitLog | null = null;

  $: $positive;
  $: logs = positive.getLogs(habitId);
  $: groups = groupLogs(logs);

  function groupLogs(ls: PositiveHabitLog[]) {
    const sorted = [...ls].sort((a, b) => b.ts - a.ts);
    const out: { label: string; logs: PositiveHabitLog[] }[] = [];
    let current: { label: string; logs: PositiveHabitLog[] } | null = null;
    for (const l of sorted) {
      const label = isToday(l.ts)
        ? 'Today'
        : isYesterday(l.ts)
        ? 'Yesterday'
        : yyyyMmDd(l.ts);
      if (!current || current.label !== label) {
        current && out.push(current);
        current = { label, logs: [l] };
      } else {
        current.logs.push(l);
      }
    }
    if (current) out.push(current);
    return out;
  }

  function openEdit(l: PositiveHabitLog) {
    editing = l;
    editDialog.open(l.note);
  }
  function saveEdit(e: CustomEvent<string>) {
    if (editing) {
      positive.editLog(editing.id, e.detail);
      editing = null;
    }
  }
  function openDelete(l: PositiveHabitLog) {
    deleting = l;
    deleteDialog.open();
  }
  function confirmDelete() {
    if (deleting) {
      positive.deleteLog(deleting.id);
      deleting = null;
    }
  }
</script>

<EditLogDialog bind:this={editDialog} on:save={saveEdit} on:cancel={() => (editing = null)} />
<ConfirmDeleteLogDialog
  bind:this={deleteDialog}
  on:confirm={confirmDelete}
  on:cancel={() => (deleting = null)}
/>

{#if logs.length === 0}
  <p>No logs yet.</p>
{:else}
  {#each groups as g}
    <h3>{g.label}</h3>
    <ul>
      {#each g.logs as l (l.id)}
        <li>
          {new Date(l.ts).toLocaleString()} — {l.note}
          <button aria-label="Edit log" on:click={() => openEdit(l)}>✏️</button>
          <button aria-label="Delete log" on:click={() => openDelete(l)}>🗑️</button>
        </li>
      {/each}
    </ul>
  {/each}
{/if}

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
  li button {
    margin-left: 0.25rem;
  }
  h3 {
    margin-top: 0.5rem;
  }
</style>
