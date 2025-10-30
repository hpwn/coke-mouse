import { browser } from '$app/environment';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (!browser) {
    throw new Error('Supabase auth is only available in the browser.');
  }

  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON as string | undefined;

    if (!url || !key) {
      throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON must be set.');
    }

    client = createClient(url, key, {
      auth: {
        persistSession: true,
        storage: window.localStorage
      }
    });
  }

  return client;
}
