'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  getFriendsWithProfiles,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  searchUsers,
} from '@/lib/social/friends-service';
import type { FriendWithPresence, UserSearchResult } from '@/types/social';

export interface UseFriendsState {
  friends: FriendWithPresence[];
  pendingReceived: FriendWithPresence[];
  pendingSent: FriendWithPresence[];
  loading: boolean;
  error: string | null;
}

export interface UseFriendsReturn extends UseFriendsState {
  sendRequest: (addresseeId: string) => Promise<{ ok: boolean; error?: string }>;
  acceptRequest: (friendRowId: string) => Promise<{ ok: boolean; error?: string }>;
  removeFriend: (friendRowId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<{ data: UserSearchResult[]; error: string | null }>;
  clearError: () => void;
}

export function useFriends(userId: string | null): UseFriendsReturn {
  const [state, setState] = useState<UseFriendsState>({
    friends: [], pendingReceived: [], pendingSent: [], loading: true, error: null,
  });
  const allRef = useRef<FriendWithPresence[]>([]);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const result = await getFriendsWithProfiles(userId);
    console.log('[useFriends] load() result:', JSON.stringify(result));
    if (!result.ok) {
      setState(s => ({ ...s, loading: false, error: result.error }));
      return;
    }
    const all = result.data;
    allRef.current = all;
    const pendingSent = all.filter(
      f => f.relation.status === 'pending' && f.relation.requester_id === userId,
    );
    console.log('[useFriends] pendingSent after load:', JSON.stringify(pendingSent));
    setState({
      friends: all.filter(f => f.relation.status === 'accepted'),
      pendingReceived: all.filter(
        f => f.relation.status === 'pending' && f.relation.addressee_id === userId,
      ),
      pendingSent,
      loading: false,
      error: null,
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    load();

    const sb = getSupabase();
    if (!sb) return;

    const channel = sb
      .channel(`friends_changes:${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'friends',
        filter: `requester_id=eq.${userId}`,
      }, () => load())
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'friends',
        filter: `addressee_id=eq.${userId}`,
      }, () => load())
      .subscribe();

    channelRef.current = channel;
    return () => { sb.removeChannel(channel); channelRef.current = null; };
  }, [userId, load]);

  const send = useCallback(async (addresseeId: string) => {
    if (!userId) return { ok: false, error: 'Not authenticated.' };
    console.log('[useFriends] sendRequest called, addresseeId:', addresseeId);
    const result = await sendFriendRequest(userId, addresseeId);
    console.log('[useFriends] sendFriendRequest result:', JSON.stringify(result));
    if (result.ok) await load();
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }, [userId, load]);

  const accept = useCallback(async (friendRowId: string) => {
    if (!userId) return { ok: false, error: 'Not authenticated.' };
    const result = await acceptFriendRequest(friendRowId, userId, allRef.current);
    if (result.ok) await load();
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }, [userId, load]);

  const remove = useCallback(async (friendRowId: string) => {
    await removeFriend(friendRowId);
    await load();
  }, [load]);

  const search = useCallback(async (query: string): Promise<{ data: UserSearchResult[]; error: string | null }> => {
    if (!userId) return { data: [], error: null };
    const result = await searchUsers(query, userId);
    if (!result.ok) {
      console.error('[useFriends] searchUsers error:', result.error);
      return { data: [], error: result.error };
    }
    return { data: result.data, error: null };
  }, [userId]);

  return {
    ...state,
    sendRequest: send,
    acceptRequest: accept,
    removeFriend: remove,
    searchUsers: search,
    clearError: () => setState(s => ({ ...s, error: null })),
  };
}
