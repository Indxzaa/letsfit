'use client';

import { getSupabase } from './supabase';
import { loadProgress, saveProgress, clearLocalProgress, subscribeToProgress, type Progress } from './progress';

const OWNER_KEY = 'letsfit:progress-owner';

/**
 * Cloud sync for the user's progress (XP, FitCoins, streaks, achievements,
 * cosmetics, etc.) via a Supabase `profiles` table.
 *
 * Behaviour:
 *  - On sign-in: pull the row from Supabase. If newer than localStorage,
 *    overwrite local. Otherwise push local up.
 *  - While signed in: every progress change writes back (debounced).
 *  - If Supabase isn't configured or the table doesn't exist, this is a
 *    no-op — the app falls back to localStorage cleanly.
 *
 * The sync is best-effort. Failures are logged but never thrown so they
 * cannot block the UI.
 */

const TABLE = 'profiles';
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let activeUserId: string | null = null;
let unsubProgress: (() => void) | null = null;
let currentUsername: string | null = null;

type ProfileRow = {
  id: string;
  username: string | null;
  data: Progress | null;
  updated_at: string | null;
};

export function getUsername(): string | null {
  return currentUsername;
}

export async function setUsername(userId: string, username: string): Promise<void> {
  currentUsername = username;
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from(TABLE).upsert({ id: userId, username, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  } catch (err) {
    console.warn('[profileSync] setUsername threw:', err);
  }
}

async function fetchRemote(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, username, data, updated_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn('[profileSync] fetch failed:', error.message);
      return null;
    }
    return (data as ProfileRow) ?? null;
  } catch (err) {
    console.warn('[profileSync] fetch threw:', err);
    return null;
  }
}

async function pushRemote(userId: string, progress: Progress): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        {
          id: userId,
          data: progress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    if (error) console.warn('[profileSync] push failed:', error.message);
  } catch (err) {
    console.warn('[profileSync] push threw:', err);
  }
}

function schedulePush(userId: string): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushRemote(userId, loadProgress());
  }, 800);
}

function isProgressEmpty(p: Progress): boolean {
  return (
    p.xp === 0 &&
    p.fitCoins === 0 &&
    p.totalReps === 0 &&
    p.totalSessions === 0 &&
    p.unlockedAchievements.length === 0 &&
    p.unlockedItems.length === 0
  );
}

export async function startSync(userId: string): Promise<void> {
  if (activeUserId === userId) return;
  activeUserId = userId;

  // Guard: if localStorage was written by a different user, wipe it before
  // loading this user's data. Without this, User B inherits User A's coins,
  // XP, achievements, etc. and that data gets pushed to User B's Supabase row.
  const storedOwner = typeof window !== 'undefined' ? localStorage.getItem(OWNER_KEY) : null;
  if (storedOwner !== userId) {
    clearLocalProgress();
    currentUsername = null;
    if (typeof window !== 'undefined') localStorage.setItem(OWNER_KEY, userId);
  }

  const remote = await fetchRemote(userId);
  const local = loadProgress();

  if (remote?.username) currentUsername = remote.username;

  if (remote?.data) {
    // If we have remote data and local is empty (fresh device), prefer remote.
    // Otherwise, prefer whichever has more cumulative XP — a safe heuristic.
    const remoteData = remote.data;
    if (isProgressEmpty(local) || remoteData.xp > local.xp) {
      saveProgress(remoteData);
    } else {
      // local is ahead — push it up
      await pushRemote(userId, local);
    }
  } else {
    // No remote yet, seed it with whatever we have
    await pushRemote(userId, local);
  }

  // Subscribe to local progress changes and mirror to remote (debounced)
  if (unsubProgress) unsubProgress();
  unsubProgress = subscribeToProgress(() => {
    if (activeUserId) schedulePush(activeUserId);
  });
}

export function stopSync(): void {
  activeUserId = null;
  currentUsername = null;
  if (unsubProgress) {
    unsubProgress();
    unsubProgress = null;
  }
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}
