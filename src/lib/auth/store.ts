import { browser } from '$app/environment';
import { writable } from 'svelte/store';

import { getSupabaseClient } from './client';

type SessionUser = { id: string; email?: string | null } | null;

export const user = writable<SessionUser>(null);

export async function restore() {
  if (!browser) return;

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  user.set(data.user ? { id: data.user.id, email: data.user.email } : null);
}

export async function signInEmail(email: string) {
  if (!browser) return;

  const base = (import.meta.env.BASE_URL || '/') as string;
  const redirectTo = new URL(base + 'auth/callback', window.location.origin).toString();

  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });

  if (error) throw error;
}

export async function signOut() {
  if (!browser) return;

  const supabase = getSupabaseClient();

  await supabase.auth.signOut();
  user.set(null);
}
