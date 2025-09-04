<script lang="ts">
import { habits, human, type Habit, validate } from './lib/store';
import { onMount } from 'svelte';

let name = '';
let list: Habit[] = [];

const unsubscribe = habits.subscribe(h => (list = h));

onMount(() => {
  return () => unsubscribe();
});

function addHabit() {
  if (name.trim()) {
    habits.add(name.trim());
    name = '';
  }
}

function logHabit(id: string) {
  habits.log(id);
}

function exportJson() {
  const data = JSON.stringify(list, null, 2);
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
</script>

<div class="controls">
  <button on:click={exportJson}>Export JSON</button>
  <input type="file" accept="application/json" on:change={importJson} />
</div>

<form on:submit|preventDefault={addHabit}>
  <input bind:value={name} placeholder="New habit" />
  <button type="submit">Add</button>
</form>

{#each list as habit}
  <div class="habit">
    <strong>{habit.name}</strong>
    <button on:click={() => logHabit(habit.id)}>Log</button>
    <ul>
      {#each habit.logs as l (l.ts)}
        <li>{new Date(l.ts).toLocaleString()} {#if l.diff}({human(l.diff)}){/if}</li>
      {/each}
    </ul>
  </div>
{/each}

<style>
form { margin-bottom: 1rem; }
.controls { margin-bottom: 1rem; }
.habit { margin-top: 1rem; }
</style>
