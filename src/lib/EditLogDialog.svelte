<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  let dialog: HTMLDialogElement;
  let textarea: HTMLTextAreaElement;
  export let note = '';
  let error = '';
  const dispatch = createEventDispatcher<{ save: string; cancel: void }>();

  export function open(initial: string) {
    note = initial;
    error = '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else (dialog as any).open = true;
    requestAnimationFrame(() => textarea?.focus());
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else (dialog as any).open = false;
  }

  function submit() {
    if (!note.trim()) {
      error = "Note can't be empty";
      return;
    }
    dispatch('save', note.trim());
    close();
  }

  function cancel() {
    close();
    dispatch('cancel');
  }
</script>

<dialog bind:this={dialog} on:cancel|preventDefault={cancel}>
  <form on:submit|preventDefault={submit}>
    <label>
      Note:
      <textarea bind:this={textarea} bind:value={note}></textarea>
    </label>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <menu>
      <button type="submit">Save</button>
      <button type="button" on:click={cancel}>Cancel</button>
    </menu>
  </form>
</dialog>

<style>
  textarea { width: 100%; }
  .error { color: red; }
</style>
