<script lang="ts">
  import { onMount } from 'svelte';
  import { listenBeforeInstallPrompt, promptInstall, isStandalone } from '$lib/pwa/install';
  let show = false;
  onMount(() => {
    if (isStandalone()) return;
    listenBeforeInstallPrompt();
    const obs = new MutationObserver(() => {
      show = document.documentElement.getAttribute('data-a2hs') === 'ready';
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-a2hs'] });
    return () => obs.disconnect();
  });
  async function doInstall() {
    try {
      await promptInstall();
    } catch {
      // ignore
    }
  }

  function close() {
    show = false;
    document.documentElement.removeAttribute('data-a2hs');
  }
</script>

{#if show}
<div class="cm-install">
  <div class="cm-install-card">
    <div class="cm-install-title">Install coke-mouse?</div>
    <div class="cm-install-actions">
      <button class="cm-btn" on:click={doInstall}>Install</button>
      <button class="cm-btn" on:click={close}>Not now</button>
    </div>
  </div>
</div>
{/if}

<style>
.cm-install{ position:fixed; left:0; right:0; bottom:0; display:flex; justify-content:center; z-index:60; padding: .75rem; }
.cm-install-card{
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: .75rem .9rem;
  box-shadow: var(--shadow);
  display:flex; gap:.6rem; align-items:center;
}
.cm-install-title{ font-weight:600; }
.cm-install-actions{ display:flex; gap:.5rem; }
</style>
