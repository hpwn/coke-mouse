<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  let dialog: HTMLDialogElement;
  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>();
  export function open() {
    dialog.showModal();
  }
  function confirm() {
    dispatch('confirm');
    dialog.close();
  }
  function cancel() {
    dialog.close();
    dispatch('cancel');
  }
</script>

<dialog bind:this={dialog} on:cancel|preventDefault={cancel}>
  <p>Delete this log? This cannot be undone.</p>
  <menu>
    <button on:click={confirm} autofocus>Delete</button>
    <button type="button" on:click={cancel}>Cancel</button>
  </menu>
</dialog>
