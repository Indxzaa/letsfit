// Raw Supabase query functions for the multiplayer room system.
// Keep business logic in service.ts — these functions only talk to the DB.

import { getSupabase } from '@/lib/supabase';

// ── Row types matching the DB schema ─────────────────────────────────────

export interface RoomRow {
  id: string;
  room_code: string;
  host_user_id: string;
  status: string;
  selected_exercise: string | null;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface RoomPlayerRow {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  is_ready: boolean;
  joined_at: string;
}

// ── Rooms ─────────────────────────────────────────────────────────────────

export async function dbInsertRoom(
  code: string,
  hostUserId: string,
): Promise<{ data: RoomRow | null; error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };
  const { data, error } = await sb
    .from('rooms')
    .insert({ room_code: code, host_user_id: hostUserId })
    .select()
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}

export async function dbGetRoomByCode(
  code: string,
): Promise<{ data: RoomRow | null; error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };
  const { data, error } = await sb
    .from('rooms')
    .select()
    .eq('room_code', code.toUpperCase())
    .maybeSingle();
  return { data: data ?? null, error: error?.message ?? null };
}

export async function dbGetRoomById(
  id: string,
): Promise<{ data: RoomRow | null; error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };
  const { data, error } = await sb
    .from('rooms')
    .select()
    .eq('id', id)
    .maybeSingle();
  return { data: data ?? null, error: error?.message ?? null };
}

export async function dbUpdateRoomHost(
  roomId: string,
  newHostUserId: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };
  const { error } = await sb
    .from('rooms')
    .update({ host_user_id: newHostUserId })
    .eq('id', roomId);
  return { error: error?.message ?? null };
}

export async function dbDeleteRoom(
  roomId: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };
  const { error } = await sb.from('rooms').delete().eq('id', roomId);
  return { error: error?.message ?? null };
}

// ── Room players ──────────────────────────────────────────────────────────

export async function dbGetRoomPlayers(
  roomId: string,
): Promise<{ data: RoomPlayerRow[]; error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { data: [], error: 'Supabase not configured.' };
  const { data, error } = await sb
    .from('room_players')
    .select()
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function dbInsertPlayer(
  roomId: string,
  userId: string,
  username: string,
): Promise<{ data: RoomPlayerRow | null; error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };
  const { data, error } = await sb
    .from('room_players')
    .insert({ room_id: roomId, user_id: userId, username })
    .select()
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}

export async function dbRemovePlayer(
  roomId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };
  const { error } = await sb
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function dbUpdatePlayerReady(
  roomId: string,
  userId: string,
  isReady: boolean,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };
  const { error } = await sb
    .from('room_players')
    .update({ is_ready: isReady })
    .eq('room_id', roomId)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function dbUpdateRoomSettings(
  roomId: string,
  settings: { selected_exercise?: string | null; duration_seconds?: number },
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };
  const { error } = await sb
    .from('rooms')
    .update(settings)
    .eq('id', roomId);
  return { error: error?.message ?? null };
}

export async function dbUpdateRoomStatus(
  roomId: string,
  status: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Supabase not configured.' };
  const { error } = await sb
    .from('rooms')
    .update({ status })
    .eq('id', roomId);
  return { error: error?.message ?? null };
}
