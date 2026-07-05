'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { getRoomWithPlayers, leaveRoom, setReady, updateRoomSettings, startWorkout } from './service';
import type { RoomRow, RoomPlayerRow } from './db';

export interface UseLobbyState {
  room: RoomRow | null;
  players: RoomPlayerRow[];
  loading: boolean;
  error: string | null;
}

export function useLobby(roomId: string | null): UseLobbyState & {
  leave:             (userId: string) => Promise<void>;
  toggleReady:       (userId: string, current: boolean) => Promise<void>;
  changeExercise:    (exercise: string) => Promise<void>;
  changeGameMode:    (mode: 'freestyle' | 'battle') => Promise<void>;
  changeBattleRounds:(rounds: number) => Promise<void>;
  triggerStart:      () => Promise<void>;
  clearError:        () => void;
} {
  const [state, setState] = useState<UseLobbyState>({
    room: null, players: [], loading: true, error: null,
  });
  const channelRef = useRef<ReturnType<
    NonNullable<ReturnType<typeof getSupabase>>['channel']
  > | null>(null);

  const load = useCallback(async () => {
    if (!roomId) return;
    const result = await getRoomWithPlayers(roomId);
    if (result.ok) {
      setState(s => ({
        ...s,
        room: result.data.room,
        players: result.data.players,
        loading: false,
        error: null,
      }));
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

    const channel = sb
      .channel(`lobby:${roomId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      }, () => load())
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, () => load())
      .subscribe();

    channelRef.current = channel;
    return () => { sb.removeChannel(channel); channelRef.current = null; };
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

  const toggleReady = useCallback(async (userId: string, current: boolean) => {
    if (!roomId) return;
    const result = await setReady(roomId, userId, !current);
    if (!result.ok) setState(s => ({ ...s, error: result.error }));
  }, [roomId]);

  const changeExercise = useCallback(async (exercise: string) => {
    if (!roomId) return;
    const result = await updateRoomSettings(roomId, { selected_exercise: exercise });
    if (!result.ok) setState(s => ({ ...s, error: result.error }));
  }, [roomId]);

  const changeGameMode = useCallback(async (mode: 'freestyle' | 'battle') => {
    if (!roomId) return;
    const result = await updateRoomSettings(roomId, { game_mode: mode });
    if (!result.ok) setState(s => ({ ...s, error: result.error }));
  }, [roomId]);

  const changeBattleRounds = useCallback(async (rounds: number) => {
    if (!roomId) return;
    const result = await updateRoomSettings(roomId, { battle_rounds: rounds });
    if (!result.ok) setState(s => ({ ...s, error: result.error }));
  }, [roomId]);

  const triggerStart = useCallback(async () => {
    if (!roomId) return;
    const result = await startWorkout(roomId);
    if (!result.ok) setState(s => ({ ...s, error: result.error }));
  }, [roomId]);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  return {
    ...state,
    leave, toggleReady, changeExercise,
    changeGameMode, changeBattleRounds,
    triggerStart, clearError,
  };
}
