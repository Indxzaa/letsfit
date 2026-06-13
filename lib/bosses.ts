import { levelFromXp } from './progress';
import type { Progress } from './progress';

export type BossTier = 'easy' | 'medium' | 'hard' | 'legendary';

export type BossRound = {
  slug: string;
  label: string;
  reps: number;
  isTimed?: boolean;
};

export type Boss = {
  id: string;
  name: string;
  flavour: string;
  tier: BossTier;
  world: number;
  rounds: BossRound[];
  timeLimitSeconds: number;
  rewards: { xp: number; coins: number };
  unlockLabel: string;
  isUnlocked: (p: Progress) => boolean;
};

export const BOSSES: Boss[] = [
  {
    id: 'boss-warm-up-king',
    name: 'The Warm-Up King',
    flavour: 'A classic test of your foundations. Three rounds. Four minutes.',
    tier: 'easy',
    world: 1,
    rounds: [
      { slug: 'jumping-jack', label: 'Jumping Jacks', reps: 20 },
      { slug: 'squat',        label: 'Squats',        reps: 10 },
      { slug: 'pushup',       label: 'Push-Ups',      reps: 8 },
    ],
    timeLimitSeconds: 240,
    rewards: { xp: 150, coins: 60 },
    unlockLabel: 'Always available',
    isUnlocked: () => true,
  },
  {
    id: 'boss-the-grinder',
    name: 'The Grinder',
    flavour: 'Consistent effort across four rounds. No shortcuts.',
    tier: 'medium',
    world: 2,
    rounds: [
      { slug: 'squat',        label: 'Squats',        reps: 15 },
      { slug: 'pushup',       label: 'Push-Ups',      reps: 12 },
      { slug: 'jumping-jack', label: 'Jumping Jacks', reps: 25 },
      { slug: 'plank',        label: 'Plank Hold',    reps: 30, isTimed: true },
    ],
    timeLimitSeconds: 360,
    rewards: { xp: 300, coins: 120 },
    unlockLabel: 'Complete 50 total reps',
    isUnlocked: (p) => p.totalReps >= 50,
  },
  {
    id: 'boss-iron-wall',
    name: 'The Iron Wall',
    flavour: 'Five rounds of real effort. Power, core, and endurance.',
    tier: 'hard',
    world: 3,
    rounds: [
      { slug: 'squat',            label: 'Squats',            reps: 20 },
      { slug: 'pushup',           label: 'Push-Ups',          reps: 15 },
      { slug: 'lunge',            label: 'Lunges',            reps: 12 },
      { slug: 'mountain-climber', label: 'Mountain Climbers', reps: 20 },
      { slug: 'plank',            label: 'Plank Hold',        reps: 45, isTimed: true },
    ],
    timeLimitSeconds: 540,
    rewards: { xp: 600, coins: 250 },
    unlockLabel: 'Reach level 5',
    isUnlocked: (p) => levelFromXp(p.xp) >= 5,
  },
  {
    id: 'boss-apex',
    name: 'APEX',
    flavour: 'Six rounds. Ten minutes. The ultimate test. No excuses.',
    tier: 'legendary',
    world: 4,
    rounds: [
      { slug: 'squat',            label: 'Squats',            reps: 25 },
      { slug: 'pushup',           label: 'Push-Ups',          reps: 20 },
      { slug: 'lunge',            label: 'Lunges',            reps: 16 },
      { slug: 'mountain-climber', label: 'Mountain Climbers', reps: 30 },
      { slug: 'high-knees',       label: 'High Knees',        reps: 40 },
      { slug: 'wall-sit',         label: 'Wall Sit',          reps: 60, isTimed: true },
    ],
    timeLimitSeconds: 600,
    rewards: { xp: 1200, coins: 500 },
    unlockLabel: 'Reach level 10',
    isUnlocked: (p) => levelFromXp(p.xp) >= 10,
  },
];

export const TIER_CONFIG: Record<BossTier, { label: string; color: string; bg: string }> = {
  easy:      { label: 'Easy',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  medium:    { label: 'Medium',    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  hard:      { label: 'Hard',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
};

export function getBoss(id: string): Boss | undefined {
  return BOSSES.find((b) => b.id === id);
}
