<script lang="ts">
  import { onMount } from 'svelte';
  let enabled = false;
  let hasManifest = false;
  let swScope: string | null = null;
  let swState: string | null = null;
  let cachesList: string[] = [];
  let bipReady = false;
  let outcome: string | null = null;
  let btnVisible = false;
  let deferred: any = null;

  function installButtonVisibility() {
    btnVisible = bipReady && !window.matchMedia('(display-mode: standalone)').matches;
  }

  async function refresh() {
    try {
      hasManifest = !!document.querySelector('link[rel="manifest"]');
      const reg = await navigator.serviceWorker.getRegistration();
      swScope = reg?.scope ?? null;
      swState = reg?.active?.state ?? reg?.installing?.state ?? reg?.waiting?.state ?? null;
      cachesList = await caches.keys();
    } catch (_) {
      // ignore - overlay is diagnostic only
    }
  }

  onMount(() => {
    const url = new URL(window.location.href);
    enabled = url.searchParams.get('pwa') === 'debug';
    if (!enabled) return;

    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      deferred = event;
      bipReady = true;
      installButtonVisibility();
    });

    refresh();
    const id = setInterval(refresh, 1500);
    return () => clearInterval(id);
  });

  async function doInstall() {
    outcome = null;
    if (!deferred) return;
    try {
      const res = await deferred.prompt();
      outcome = res?.outcome ?? null;
      deferred = null;
      bipReady = false;
      installButtonVisibility();
      await refresh();
    } catch (err) {
      outcome = String(err);
    }
  }
</script>

{#if enabled}
<div class="cm-pwa-debug">
  <div class="row"><strong>PWA Debug</strong></div>
  <div class="row"><span>manifest link:</span> <code>{hasManifest ? 'yes' : 'no'}</code></div>
  <div class="row"><span>sw scope:</span> <code>{swScope ?? '—'}</code></div>
  <div class="row"><span>sw state:</span> <code>{swState ?? '—'}</code></div>
  <div class="row"><span>caches:</span> <code>{cachesList.join(', ') || '—'}</code></div>
  <div class="row"><span>beforeinstallprompt:</span> <code>{bipReady ? 'ready' : 'not fired'}</code></div>
  <div class="row" style="gap:.5rem">
    {#if btnVisible}
      <button class="cm-btn" on:click={doInstall}>Install</button>
    {/if}
    {#if outcome}<span>result: <code>{outcome}</code></span>{/if}
  </div>
</div>
{/if}

<style>
  .cm-pwa-debug {
    position: fixed;
    left: 0.75rem;
    bottom: 0.75rem;
    z-index: 70;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: var(--shadow);
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .cm-pwa-debug .row {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    margin: 0.15rem 0;
  }

  .cm-pwa-debug code {
    background: var(--chip);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.05rem 0.35rem;
  }
</style>
