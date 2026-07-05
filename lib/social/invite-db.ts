import { getSupabase } from '@/lib/supabase';
import type { InviteRow, InviteWithSender } from '@/types/social';

type DbResult<T> = { data: T | null; error: string | null };
type DbVoid = { error: string | null };

export async function dbGetPendingInvites(userId: string): Promise<DbResult<InviteWithSender[]>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  // Step 1: fetch invite rows — no inline join (invites.from_user refs auth.users, not profiles)
  const { data: rows, error: rowsError } = await sb
    .from('invites')
    .select('id, from_user, to_user, room_id, status, created_at')
    .eq('to_user', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (rowsError) {
    console.error('[dbGetPendingInvites] invites query error:', rowsError.message);
    return { data: null, error: rowsError.message };
  }

  if (!rows || rows.length === 0) return { data: [], error: null };

  // Step 2: batch-fetch sender profiles
  const senderIds = [...new Set(rows.map((r: Record<string, unknown>) => r.from_user as string))];

  const { data: profiles, error: profilesError } = await sb
    .from('profiles')
    .select('id, username, data')
    .in('id', senderIds);

  if (profilesError) {
    console.error('[dbGetPendingInvites] profiles query error:', profilesError.message);
    return { data: null, error: profilesError.message };
  }

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; username: string; data: Record<string, unknown> }) => [p.id, p])
  );

  // Step 3: join in code
  const enriched: InviteWithSender[] = rows.map((row: Record<string, unknown>) => {
    const sender = profileMap.get(row.from_user as string);
    return {
      id: row.id as string,
      from_user: row.from_user as string,
      to_user: row.to_user as string,
      room_id: row.room_id as string,
      status: row.status as InviteRow['status'],
      created_at: row.created_at as string,
      sender_username: sender?.username ?? 'Unknown',
      sender_avatar: (sender?.data?.avatar as string | null) ?? null,
    };
  });

  return { data: enriched, error: null };
}

export async function dbGetPendingInviteByPair(
  fromUser: string,
  toUser: string,
): Promise<DbResult<InviteRow>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from('invites')
    .select('*')
    .eq('from_user', fromUser)
    .eq('to_user', toUser)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as InviteRow | null, error: null };
}

export async function dbInsertInvite(
  fromUser: string,
  toUser: string,
  roomId: string,
): Promise<DbResult<InviteRow>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from('invites')
    .insert({ from_user: fromUser, to_user: toUser, room_id: roomId, status: 'pending' })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as InviteRow, error: null };
}

export async function dbUpdateInviteStatus(
  inviteId: string,
  status: 'accepted' | 'declined',
): Promise<DbResult<InviteRow>> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from('invites')
    .update({ status })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as InviteRow, error: null };
}

export async function dbDeleteInvitesByRoom(roomId: string): Promise<DbVoid> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };

  const { error } = await sb.from('invites').delete().eq('room_id', roomId);
  return { error: error?.message ?? null };
}
