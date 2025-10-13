<script lang="ts">
  import { onMount } from 'svelte';

  type Theme = 'light' | 'dark';
  const KEY = 'cm.theme';

  const getTheme = (): Theme =>
    (document.documentElement.getAttribute('data-theme') as Theme) || 'light';

  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    current = theme;
  };

  let current: Theme = 'light';

  onMount(() => {
    current = getTheme();
  });

  function toggle() {
    const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }
</script>

<button class="cm-theme-toggle" aria-label="Toggle theme" on:click={toggle}>
  {#if current === 'dark'}
    ☀︎ Light
  {:else}
    ☾ Dark
  {/if}
</button>
