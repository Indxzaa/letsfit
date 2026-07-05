// Shared TypeScript types for the Workout Together multiplayer feature.
// Phase 1: UI / mock data only.
// Phase 2 will wire these to Supabase Realtime.
// Phase 3 will add WebRTC peer state.

export type RoomMode = 'create' | 'join';

export type PlayerStatus = 'waiting' | 'ready' | 'in_session' | 'disconnected';

export type RoomStatus = 'lobby' | 'exercise_select' | 'countdown' | 'active' | 'finished';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  status: PlayerStatus;
  reps: number;
  avatarEmoji?: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  players: Player[];
  exercise: string | null;
  durationSeconds: number;
  createdAt: number;
}

export interface WorkoutResult {
  exercise: string;
  myReps: number;
  friendReps: number;
  durationSeconds: number;
  xpEarned: number;
  coinsEarned: number;
  won: boolean;
}
