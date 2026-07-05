import { getSupabase } from '@/lib/supabase';
import type { FriendRow, FriendWithPresence } from '@/types/social';

type DbResult<T> = { data: T | null; error: string | null };
type DbVoid = { error: string | null };

export async function dbGetFriends(userId: string): Promise<DbResult<FriendWithPresence[]>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from('friends')
    .select(`
      id, requester_id, addressee_id, status, created_at,
      requester:profiles!friends_requester_id_fkey(id, username, data),
      addressee:profiles!friends_addressee_id_fkey(id, username, data)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (error) return { data: null, error: error.message };

  const enriched: FriendWithPresence[] = (data ?? []).map((row: Record<string, unknown>) => {
    const isRequester = (row.requester_id as string) === userId;
    const profile = (isRequester ? row.addressee : row.requester) as { id: string; username: string; data: Record<string, unknown> } | null;
    return {
      relation: {
        id: row.id as string,
        requester_id: row.requester_id as string,
        addressee_id: row.addressee_id as string,
        status: row.status as FriendRow['status'],
        created_at: row.created_at as string,
      },
      profile: {
        id: profile?.id ?? '',
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

  const { data, error } = await sb
    .from('friends')
    .select('*')
    .or(
      `and(requester_id.eq.${userA},addressee_id.eq.${userB}),and(requester_id.eq.${userB},addressee_id.eq.${userA})`,
    )
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as FriendRow | null, error: null };
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

  if (error) return { data: null, error: error.message };
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
  excludeUserId: string,
): Promise<DbResult<Array<{ id: string; username: string; avatar: string | null }>>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from('profiles')
    .select('id, username, data')
    .ilike('username', `%${query}%`)
    .neq('id', excludeUserId)
    .limit(10);

  if (error) return { data: null, error: error.message };

  const results = (data ?? []).map((p: { id: string; username: string; data: Record<string, unknown> }) => ({
    id: p.id,
    username: p.username ?? 'Unknown',
    avatar: (p.data?.avatar as string | null) ?? null,
  }));

  return { data: results, error: null };
}
