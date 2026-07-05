import { getSupabase } from '@/lib/supabase';
import type { PresenceStatus } from '@/types/social';

// Minimum ms between DB presence upserts — mirrors the 200ms throttle in workout-sync.ts
const THROTTLE_MS = 3000;

let lastUpsertTime = 0;

export async function upsertPresence(
  userId: string,
  status: PresenceStatus,
  activity: string | null,
): Promise<void> {
  const now = Date.now();
  if (now - lastUpsertTime < THROTTLE_MS) return;
  lastUpsertTime = now;

  const sb = getSupabase();
  if (!sb) return;

  await sb.from('presence').upsert(
    { user_id: userId, status, current_activity: activity, last_seen: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
}

export async function setOffline(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  await sb.from('presence').upsert(
    { user_id: userId, status: 'offline', current_activity: null, last_seen: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
}

export async function getPresenceForUsers(
  userIds: string[],
): Promise<Array<{ user_id: string; status: PresenceStatus; current_activity: string | null; last_seen: string }>> {
  if (userIds.length === 0) return [];
  const sb = getSupabase();
  if (!sb) return [];

  const { data } = await sb
    .from('presence')
    .select('user_id, status, current_activity, last_seen')
    .in('user_id', userIds);

  return (data ?? []) as Array<{ user_id: string; status: PresenceStatus; current_activity: string | null; last_seen: string }>;
}
