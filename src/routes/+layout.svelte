<script lang="ts">
  import '../styles/theme.css';
  import '../styles/components.css';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import InstallHint from '$lib/components/InstallHint.svelte';
</script>

<slot />
<ThemeToggle />
<InstallHint />
