<script lang="ts">
  import type { Log } from './types';
  export let logs: Log[] = [];

  function note(l: Log): string {
    return (l as any).note ?? 'logged';
  }
</script>

{#if logs.length === 0}
  <p>No logs yet.</p>
{:else}
  <ul>
    {#each logs as l (l.at)}
      <li>{new Date(l.at).toLocaleString()} — {note(l)}</li>
    {/each}
  </ul>
{/if}

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
