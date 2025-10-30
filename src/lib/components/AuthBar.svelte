<script lang="ts">
  import { onMount } from 'svelte';

  import { restore, signInEmail, signOut, user } from '$lib/auth/store';

  let email = '';
  let message = '';
  let u: { id: string; email?: string | null } | null = null;
  let loading = false;

  onMount(() => {
    const unsubscribe = user.subscribe((value) => {
      u = value;
    });

    restore().catch((error) => {
      console.error('Failed to restore session', error);
    });

    return () => {
      unsubscribe();
    };
  });

  async function login() {
    if (!email) return;

    loading = true;
    message = '';

    try {
      await signInEmail(email);
      message = 'Check your email for a sign-in link.';
      email = '';
    } catch (error: unknown) {
      const err = error as { message?: string };
      message = err?.message ?? 'Could not send magic link.';
      console.error('Magic link error', error);
    } finally {
      loading = false;
    }
  }

  async function logout() {
    message = '';

    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error', error);
      message = 'Sign out failed.';
    }
  }
</script>

<div class="auth-bar">
  {#if u}
    <span class="pill">Signed in {u.email ? `as ${u.email}` : ''}</span>
    <button class="cm-btn" on:click={logout}>Sign out</button>
  {:else}
    <input
      type="email"
      placeholder="you@example.com"
      bind:value={email}
      aria-label="Email for magic link"
      autocomplete="email"
    />
    <button class="cm-btn" on:click={login} disabled={loading}>
      {#if loading}
        Sending…
      {:else}
        Email link
      {/if}
    </button>
  {/if}
  {#if message}
    <span class="note">{message}</span>
  {/if}
</div>

<style>
  .auth-bar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .auth-bar input[type='email'] {
    min-width: 16rem;
  }

  .pill {
    background: var(--chip);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.2rem 0.5rem;
  }

  .note {
    font-size: 0.85rem;
    color: var(--muted);
  }
</style>
