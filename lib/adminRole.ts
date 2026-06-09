'use client';

import { getSupabase } from './supabase';

export type UserRole = 'user' | 'admin';

export async function fetchRole(userId: string): Promise<UserRole> {
  const supabase = getSupabase();
  if (!supabase) return 'user';
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.role as UserRole) ?? 'user';
}

export type AdminUser = {
  id: string;
  username: string | null;
  role: string;
  xp: number;
  fit_coins: number;
  total_sessions: number;
  total_reps: number;
  achievement_count: number;
  unlocked_items: number;
  updated_at: string | null;
};

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('admin_users_view')
    .select('*')
    .order('fit_coins', { ascending: false });
  if (error) {
    console.error('[adminRole] fetchAllUsers:', error.message);
    return [];
  }
  return (data ?? []) as AdminUser[];
}

export async function grantCoins(userId: string, amount: number): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Not configured';
  const { data: profile, error: fetchErr } = await supabase
    .from('profiles')
    .select('data')
    .eq('id', userId)
    .maybeSingle();
  if (fetchErr || !profile) return fetchErr?.message ?? 'User not found';
  const current = (profile.data as Record<string, unknown>) ?? {};
  const { error } = await supabase
    .from('profiles')
    .update({ data: { ...current, fitCoins: ((current.fitCoins as number) ?? 0) + amount } })
    .eq('id', userId);
  return error?.message ?? null;
}

export async function setUserRole(userId: string, role: UserRole): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Not configured';
  const { error: re } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (re) return re.message;
  const { error: pe } = await supabase.from('profiles').update({ role }).eq('id', userId);
  return pe?.message ?? null;
}

export async function resetUserProgress(userId: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Not configured';
  const { error } = await supabase.from('profiles').update({ data: {} }).eq('id', userId);
  return error?.message ?? null;
}
