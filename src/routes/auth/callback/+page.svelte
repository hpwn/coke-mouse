<script lang="ts">
  import { onMount } from 'svelte';

  import { restore } from '$lib/auth/store';

  let errorMessage: string | undefined;

  onMount(async () => {
    try {
      await restore();
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message;
      errorMessage = message ?? String(error);
    } finally {
      const base = (import.meta.env.BASE_URL || '/') as string;
      const target = new URL(base, window.location.origin).toString();

      setTimeout(() => {
        window.location.href = target;
      }, 600);
    }
  });
</script>

{#if errorMessage}
  <p>Auth error: {errorMessage}</p>
{/if}
<p>Signing you in…</p>
