<script lang="ts">
  import '../styles/theme.css';
  import '../styles/components.css';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import InstallHint from '$lib/components/InstallHint.svelte';
  import PWADebug from '$lib/components/PWADebug.svelte';
  import AuthBar from '$lib/components/AuthBar.svelte';
</script>

<slot />
<AuthBar />
<ThemeToggle />
<InstallHint />
<PWADebug />
