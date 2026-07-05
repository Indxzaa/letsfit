// Session event types + broadcast helpers — Round-Based Co-op Workout System.
// Uses Supabase Realtime broadcast; no data is written to the database.

import { getSupabase } from '@/lib/supabase';

// ── Event types ───────────────────────────────────────────────────────────

export type WorkoutSessionEvent =
  | { type: 'navigate';         roomId: string; exercise: string; mode: string }
  | { type: 'countdown';        value: number | 'GO!' }
  | { type: 'start';            startedAt: number; exercise: string }
  | { type: 'round_finish';     userId: string; reps: number }
  | { type: 'round_complete';   playerA: { userId: string; reps: number }; playerB: { userId: string; reps: number } }
  | { type: 'exercise_selected'; exercise: string }
  | { type: 'pause';            pausedAt: number }
  | { type: 'resume';           resumedAt: number; adjustedStartAt: number }
  | { type: 'status';           userId: string; status: PlayerWorkoutStatus }
  | { type: 'leave';            userId: string };

export type PlayerWorkoutStatus =
  | 'preparing'
  | 'working-out'
  | 'round-finished'
  | 'paused'
  | 'disconnected';

export type SessionPhase =
  | 'idle'
  | 'selecting'       // between rounds — choosing next exercise
  | 'countdown'       // 3-2-1-GO
  | 'active'          // round in progress
  | 'paused'
  | 'round_complete'  // both players finished this round
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
