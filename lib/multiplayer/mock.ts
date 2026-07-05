// Phase 1 mock data helpers for Workout Together.
// Replace these with real Supabase calls in Phase 2.

import type { Room, Player, WorkoutResult } from './types';
import { MOCK_ROOM_CODE, XP_PER_REP, COINS_PER_REP } from './constants';

/** Generate a mock room code. Phase 2: insert to Supabase and return real code. */
export function generateRoomCode(): string {
  return MOCK_ROOM_CODE;
}

/** Build the mock "You" player. Phase 2: use auth user id/name. */
export function mockSelfPlayer(isHost: boolean): Player {
  return {
    id: 'self',
    name: 'You',
    isHost,
    status: 'waiting',
    reps: 0,
    avatarEmoji: '🙂',
  };
}

/** Build the mock friend placeholder. Phase 2: populated by Supabase presence. */
export function mockFriendPlaceholder(isHost: boolean): Player {
  return {
    id: 'friend',
    name: isHost ? 'Guest' : 'Host',
    isHost: !isHost,
    status: 'waiting',
    reps: 0,
    avatarEmoji: '👤',
  };
}

/** Build a mock Room for Phase 1 UI. */
export function mockRoom(code: string, isHost: boolean): Room {
  return {
    code,
    status: 'lobby',
    players: [mockSelfPlayer(isHost), mockFriendPlaceholder(isHost)],
    exercise: null,
    durationSeconds: 300,
    createdAt: Date.now(),
  };
}

/** Compute workout result from final rep counts. */
export function computeResult(
  exercise: string,
  myReps: number,
  friendReps: number,
  durationSeconds: number,
): WorkoutResult {
  return {
    exercise,
    myReps,
    friendReps,
    durationSeconds,
    xpEarned: Math.round(myReps * XP_PER_REP),
    coinsEarned: Math.round(myReps * COINS_PER_REP),
    won: myReps >= friendReps,
  };
}
