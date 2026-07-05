import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const AUTH_STORAGE_KEY = 'letsfit:auth';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: AUTH_STORAGE_KEY,
      },
    });
  }
  return client;
}

/**
 * Wipes all Supabase auth keys from localStorage.
 * Called when a corrupted or expired refresh token is detected so the
 * user can log in fresh without manually clearing browser storage.
 */
export function clearCorruptedSession(): void {
  if (typeof window === 'undefined') return;
  try {
    // Remove the main session key
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Remove any additional Supabase-internal keys (code verifier, etc.)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.startsWith('supabase.'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth] Corrupted session cleared from localStorage.');
    }
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export const isSupabaseConfigured = Boolean(url && anonKey);
