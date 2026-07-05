// React hooks for the Workout Together room system.
// Handles loading, Realtime subscriptions, and leave-on-unmount cleanup.

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { getRoomWithPlayers, leaveRoom } from './service';
import type { RoomRow, RoomPlayerRow } from './db';

export interface UseLobbyState {
  room: RoomRow | null;
  players: RoomPlayerRow[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads a room by ID and subscribes to Realtime changes on room_players.
 * Automatically refreshes when a player joins or leaves.
 * Call `leave(userId)` to remove the current user and unsubscribe.
 */
export function useLobby(roomId: string | null): UseLobbyState & {
  leave: (userId: string) => Promise<void>;
  clearError: () => void;
} {
  const [state, setState] = useState<UseLobbyState>({
    room: null,
    players: [],
    loading: true,
    error: null,
  });
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null>(null);

  const load = useCallback(async () => {
    if (!roomId) return;
    const result = await getRoomWithPlayers(roomId);
    if (result.ok) {
      setState(s => ({ ...s, room: result.data.room, players: result.data.players, loading: false, error: null }));
    } else {
      setState(s => ({ ...s, loading: false, error: result.error }));
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    setState(s => ({ ...s, loading: true }));
    load();

    const sb = getSupabase();
    if (!sb) return;

    // Subscribe to room_players changes for this room only
    const channel = sb
      .channel(`room_players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Re-fetch the full player list on any change (join/leave)
          load();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      sb.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, load]);

  const leave = useCallback(async (userId: string) => {
    if (!roomId) return;
    const sb = getSupabase();
    if (sb && channelRef.current) {
      sb.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    await leaveRoom(roomId, userId);
  }, [roomId]);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return { ...state, leave, clearError };
}
