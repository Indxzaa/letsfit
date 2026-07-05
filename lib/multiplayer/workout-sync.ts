// Multiplayer workout state sync — reps and status only.
// Camera frames, pose landmarks, and AI data are NEVER transmitted.
// Uses the same Supabase Realtime broadcast pattern as signaling.ts.

import { getSupabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────

export type ExerciseState = 'idle' | 'working' | 'finished';

export interface PlayerWorkoutState {
  userId:        string;
  repCount:      number;
  exerciseState: ExerciseState;
  finishFlag:    boolean;
  timestamp:     number;
}

export type WorkoutSyncEvent =
  | { type: 'state_update'; state: PlayerWorkoutState }
  | { type: 'both_finished' };

export type WorkoutSyncHandler = (event: WorkoutSyncEvent) => void;

// ── Channel helpers ───────────────────────────────────────────────────────

function syncChannel(roomId: string) {
  return `workout_sync:${roomId}`;
}

export function subscribeWorkoutSync(
  roomId: string,
  onEvent: WorkoutSyncHandler,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb
    .channel(syncChannel(roomId))
    .on('broadcast', { event: 'sync' }, ({ payload }) => {
      if (payload?.type) onEvent(payload as WorkoutSyncEvent);
    })
    .subscribe();

  return () => { sb.removeChannel(channel); };
}

export async function broadcastWorkoutState(
  roomId: string,
  state: PlayerWorkoutState,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.channel(syncChannel(roomId)).send({
    type: 'broadcast',
    event: 'sync',
    payload: { type: 'state_update', state },
  });
}

export async function broadcastBothFinished(roomId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.channel(syncChannel(roomId)).send({
    type: 'broadcast',
    event: 'sync',
    payload: { type: 'both_finished' },
  });
}
