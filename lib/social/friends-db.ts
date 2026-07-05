import { getSupabase } from '@/lib/supabase';
import type { FriendRow, FriendWithPresence, FriendRelationStatus, UserSearchResult } from '@/types/social';

type DbResult<T> = { data: T | null; error: string | null };
type DbVoid = { error: string | null };

export async function dbGetFriends(userId: string): Promise<DbResult<FriendWithPresence[]>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  // Step 1: fetch friend rows (no FK join — friends.requester_id refs auth.users, not profiles)
  const { data: rows, error: rowsError } = await sb
    .from('friends')
    .select('id, requester_id, addressee_id, status, created_at')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (rowsError) {
    console.error('[dbGetFriends] friends query error:', rowsError.message);
    return { data: null, error: rowsError.message };
  }

  if (!rows || rows.length === 0) return { data: [], error: null };

  // Step 2: batch-fetch profiles for the other user in each relationship
  const otherIds = [...new Set(
    rows.map((r: Record<string, unknown>) =>
      (r.requester_id as string) === userId ? r.addressee_id as string : r.requester_id as string
    )
  )];

  const { data: profiles, error: profilesError } = await sb
    .from('profiles')
    .select('id, username, data')
    .in('id', otherIds);

  if (profilesError) {
    console.error('[dbGetFriends] profiles query error:', profilesError.message);
    return { data: null, error: profilesError.message };
  }

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; username: string; data: Record<string, unknown> }) => [p.id, p])
  );

  // Step 3: join in code
  const enriched: FriendWithPresence[] = rows.map((row: Record<string, unknown>) => {
    const otherId = (row.requester_id as string) === userId
      ? row.addressee_id as string
      : row.requester_id as string;
    const profile = profileMap.get(otherId);
    return {
      relation: {
        id: row.id as string,
        requester_id: row.requester_id as string,
        addressee_id: row.addressee_id as string,
        status: row.status as FriendRow['status'],
        created_at: row.created_at as string,
      },
      profile: {
        id: otherId,
        username: profile?.username ?? 'Unknown',
        avatar: (profile?.data?.avatar as string | null) ?? null,
      },
    };
  });

  return { data: enriched, error: null };
}

export async function dbGetFriendByPair(
  userA: string,
  userB: string,
): Promise<DbResult<FriendRow>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  // Two simple queries instead of a nested and() OR which is unreliable in PostgREST
  const { data: ab, error: errAB } = await sb
    .from('friends')
    .select('*')
    .eq('requester_id', userA)
    .eq('addressee_id', userB)
    .maybeSingle();

  if (errAB) {
    console.error('[dbGetFriendByPair] query AB error:', errAB.message);
    return { data: null, error: errAB.message };
  }
  if (ab) return { data: ab as FriendRow, error: null };

  const { data: ba, error: errBA } = await sb
    .from('friends')
    .select('*')
    .eq('requester_id', userB)
    .eq('addressee_id', userA)
    .maybeSingle();

  if (errBA) {
    console.error('[dbGetFriendByPair] query BA error:', errBA.message);
    return { data: null, error: errBA.message };
  }
  return { data: ba as FriendRow | null, error: null };
}

export async function dbInsertFriendRequest(
  requesterId: string,
  addresseeId: string,
): Promise<DbResult<FriendRow>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from('friends')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
    .select()
    .single();

  if (error) {
    console.error('[dbInsertFriendRequest] Supabase error:', error.message, error);
    return { data: null, error: error.message };
  }
  return { data: data as FriendRow, error: null };
}

export async function dbAcceptFriendRequest(friendRowId: string): Promise<DbVoid> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };

  const { error } = await sb
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendRowId);

  return { error: error?.message ?? null };
}

export async function dbDeleteFriend(friendRowId: string): Promise<DbVoid> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };

  const { error } = await sb.from('friends').delete().eq('id', friendRowId);
  return { error: error?.message ?? null };
}

export async function dbSearchProfiles(
  query: string,
  currentUserId: string,
): Promise<DbResult<UserSearchResult[]>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  // Step 1: search profiles
  const { data: profiles, error: profilesError } = await sb
    .from('profiles')
    .select('id, username, data')
    .ilike('username', `%${query}%`)
    .neq('id', currentUserId)
    .limit(10);

  if (profilesError) {
    console.error('[dbSearchProfiles] Supabase error:', profilesError.message, profilesError);
    return { data: null, error: profilesError.message };
  }

  if (!profiles || profiles.length === 0) return { data: [], error: null };

  // Step 2: fetch all existing friend rows involving currentUser
  const { data: friendRows } = await sb
    .from('friends')
    .select('id, requester_id, addressee_id, status')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

  // Build a map: otherUserId → { relation, friendRowId }
  type RelEntry = { relation: FriendRelationStatus; friendRowId: string };
  const relMap = new Map<string, RelEntry>();

  for (const row of (friendRows ?? []) as Array<{ id: string; requester_id: string; addressee_id: string; status: string }>) {
    const otherId = row.requester_id === currentUserId ? row.addressee_id : row.requester_id;
    let rel: FriendRelationStatus = 'none';
    if (row.status === 'accepted') {
      rel = 'friends';
    } else if (row.status === 'pending') {
      rel = row.requester_id === currentUserId ? 'pending_sent' : 'pending_received';
    }
    relMap.set(otherId, { relation: rel, friendRowId: row.id });
  }

  // Step 3: merge
  const results: UserSearchResult[] = profiles.map((p: { id: string; username: string; data: Record<string, unknown> }) => {
    const entry = relMap.get(p.id);
    return {
      id: p.id,
      username: p.username ?? 'Unknown',
      avatar: (p.data?.avatar as string | null) ?? null,
      relation: entry?.relation ?? 'none',
      friendRowId: entry?.friendRowId ?? null,
    };
  });

  return { data: results, error: null };
}
