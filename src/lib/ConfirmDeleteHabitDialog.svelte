<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let habitName = '';
  const dispatch = createEventDispatcher();
  let dialog: HTMLDialogElement;
  let input: HTMLInputElement;
  let text = '';
  $: match = text === habitName;

  export function open() {
    text = '';
    dialog.showModal();
    requestAnimationFrame(() => input.focus());
  }

  export function close() {
    dialog.close();
  }

  function cancel() {
    close();
    dispatch('cancel');
  }

  function confirm() {
    if (!match) return;
    close();
    dispatch('confirm');
  }
</script>

<dialog bind:this={dialog} on:cancel|preventDefault={cancel}>
  <form method="dialog" on:submit|preventDefault={confirm}>
    <h2>Delete habit</h2>
    <p>This will permanently delete '{habitName}' and all of its logs. This action cannot be undone.</p>
    <label>
      Type the habit's name to confirm
      <input bind:this={input} bind:value={text} aria-describedby="delete-help" />
    </label>
    <p id="delete-help">Type the name exactly to enable delete.</p>
    <menu>
      <button type="button" on:click={cancel}>Cancel</button>
      <button type="submit" disabled={!match} aria-disabled={!match}>Delete</button>
    </menu>
  </form>
</dialog>

<style>
  dialog::backdrop { backdrop-filter: blur(2px); }
  menu { display: flex; gap: 0.5rem; justify-content: flex-end; }
  button[disabled] { opacity: 0.5; }
</style>
