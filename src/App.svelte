<script lang="ts">
import { habits, human, type Habit } from './lib/store';
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

function logHabit(id: number) {
  habits.log(id);
}
</script>

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
.habit { margin-top: 1rem; }
</style>
