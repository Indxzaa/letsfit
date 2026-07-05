// Shared constants for the Workout Together multiplayer feature.

export const MOCK_ROOM_CODE = 'LFIT42';

export const MAX_PLAYERS = 2;
export const ROOM_CODE_LENGTH = 6;

/** Exercises available in multiplayer mode (subset of all exercises). */
export const MULTIPLAYER_EXERCISES = [
  { slug: 'pushup',           name: 'Push Ups',          emoji: '💪', cardBg: 'var(--card-bg-green)'  },
  { slug: 'squat',            name: 'Squats',             emoji: '🦵', cardBg: 'var(--card-bg-blue)'   },
  { slug: 'jumping-jack',     name: 'Jumping Jacks',      emoji: '⭐', cardBg: 'var(--card-bg-amber)'  },
  { slug: 'mountain-climber', name: 'Mountain Climbers',  emoji: '🏔️', cardBg: 'var(--card-bg-purple)' },
  { slug: 'high-knees',       name: 'High Knees',         emoji: '🏃', cardBg: 'var(--card-bg-green)'  },
  { slug: 'slow-burpee',      name: 'Burpees',            emoji: '🔥', cardBg: 'var(--card-bg-amber)'  },
] as const;

export type MultiplayerExerciseSlug = (typeof MULTIPLAYER_EXERCISES)[number]['slug'];

/** Human-readable labels used across session/results pages. */
export const EXERCISE_LABELS: Record<string, string> = Object.fromEntries(
  MULTIPLAYER_EXERCISES.map(e => [e.slug, e.name])
);

/** XP and coins earned per rep in multiplayer mode (same as solo). */
export const XP_PER_REP    = 5;
export const COINS_PER_REP = 2;

/** Interval (ms) at which the mock friend auto-increments their rep count. */
export const MOCK_FRIEND_REP_INTERVAL_MS = 2800;
