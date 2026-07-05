// Session event types + broadcast helpers for Phase 5 synchronized workout.
// Uses the same Supabase Realtime broadcast pattern as signaling.ts.
// Timekeeping is host-authoritative: host embeds startedAt timestamps;
// both players compute remaining time from Date.now() - startedAt.

import { getSupabase } from '@/lib/supabase';

// ── Event types ───────────────────────────────────────────────────────────

export type WorkoutSessionEvent =
  | { type: 'navigate';  roomId: string; exercise: string; duration: number; mode: string }
  | { type: 'countdown'; value: number | 'GO!' }
  | { type: 'start';     startedAt: number; duration: number; exercise: string }
  | { type: 'pause';     pausedAt: number }
  | { type: 'resume';    resumedAt: number; adjustedStartAt: number }
  | { type: 'finish' }
  | { type: 'status';    userId: string; status: PlayerWorkoutStatus }
  | { type: 'leave';     userId: string };

export type PlayerWorkoutStatus =
  | 'preparing'
  | 'working-out'
  | 'paused'
  | 'finished'
  | 'disconnected';

export type SessionPhase =
  | 'idle'
  | 'countdown'
  | 'active'
  | 'paused'
  | 'finished'
  | 'partner-left';

// ── Channel helpers ───────────────────────────────────────────────────────

function sessionChannel(roomId: string) {
  return `workout_session:${roomId}`;
}

export type SessionEventHandler = (event: WorkoutSessionEvent) => void;

export function subscribeSessionEvents(
  roomId: string,
  onEvent: SessionEventHandler,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb
    .channel(sessionChannel(roomId))
    .on('broadcast', { event: 'session' }, ({ payload }) => {
      if (payload?.type) onEvent(payload as WorkoutSessionEvent);
    })
    .subscribe();

  return () => { sb.removeChannel(channel); };
}

export async function broadcastSessionEvent(
  roomId: string,
  event: WorkoutSessionEvent,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.channel(sessionChannel(roomId)).send({
    type: 'broadcast',
    event: 'session',
    payload: event,
  });
}
