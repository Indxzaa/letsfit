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
    name: 'Forest Queen',
    flavour: 'A classic test of your foundations. Three rounds. Four minutes.',
    tier: 'easy',
    world: 1,
    rounds: [
      { slug: 'jumping-jack', label: 'Jumping Jacks', reps: 20 },
      { slug: 'squat',        label: 'Squats',        reps: 10 },
      { slug: 'pushup',       label: 'Push-Ups',      reps: 8 },
    ],
    timeLimitSeconds: 180,
    rewards: { xp: 150, coins: 60 },
    unlockLabel: 'Always available',
    isUnlocked: () => true,
  },
  {
    id: 'boss-the-grinder',
    name: 'Arctic Queen',
    flavour: 'Consistent effort across four rounds. No shortcuts.',
    tier: 'medium',
    world: 2,
    rounds: [
      { slug: 'squat',        label: 'Squats',        reps: 15 },
      { slug: 'pushup',       label: 'Push-Ups',      reps: 12 },
      { slug: 'jumping-jack', label: 'Jumping Jacks', reps: 25 },
      { slug: 'plank',        label: 'Plank Hold',    reps: 30, isTimed: true },
    ],
    timeLimitSeconds: 210,
    rewards: { xp: 300, coins: 120 },
    unlockLabel: 'Complete 50 total reps',
    isUnlocked: (p) => p.totalReps >= 50,
  },
  {
    id: 'boss-iron-wall',
    name: 'The Witch',
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
    timeLimitSeconds: 270,
    rewards: { xp: 600, coins: 250 },
    unlockLabel: 'Reach level 5',
    isUnlocked: (p) => levelFromXp(p.xp) >= 5,
  },
  {
    id: 'boss-apex',
    name: 'Elf Beast',
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
    timeLimitSeconds: 360,
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

export type BossGameConfig = {
  image: string;
  displayH: number;
  moveEveryMs: number;
  moveDurationS: number;
  attackEveryMs: [number, number];
  attackWarningMs: number;
  attackActiveMs: number;
  penaltyReps: number;
  penaltyImmunityMs: number;
  attackColor: string;
};

export const BOSS_GAME_CONFIGS: Record<string, BossGameConfig> = {
  'boss-warm-up-king': {
    image: '/Boss 1.png',
    displayH: 200,
    moveEveryMs: 7000,
    moveDurationS: 2.0,
    attackEveryMs: [16000, 24000],
    attackWarningMs: 1600,
    attackActiveMs: 1000,
    penaltyReps: 1,
    penaltyImmunityMs: 8000,
    attackColor: '#4ade80',
  },
  'boss-the-grinder': {
    image: '/Boss 2.png',
    displayH: 210,
    moveEveryMs: 3500,
    moveDurationS: 1.0,
    attackEveryMs: [7000, 10000],
    attackWarningMs: 1100,
    attackActiveMs: 1000,
    penaltyReps: 2,
    penaltyImmunityMs: 4500,
    attackColor: '#60a5fa',
  },
  'boss-iron-wall': {
    image: '/Boss 3.png',
    displayH: 220,
    moveEveryMs: 1800,
    moveDurationS: 0.65,
    attackEveryMs: [3500, 5500],
    attackWarningMs: 800,
    attackActiveMs: 1200,
    penaltyReps: 3,
    penaltyImmunityMs: 2800,
    attackColor: '#c084fc',
  },
  'boss-apex': {
    image: '/Boss 4.png',
    displayH: 230,
    moveEveryMs: 900,
    moveDurationS: 0.35,
    attackEveryMs: [2000, 3200],
    attackWarningMs: 550,
    attackActiveMs: 1500,
    penaltyReps: 4,
    penaltyImmunityMs: 1800,
    attackColor: '#fbbf24',
  },
};
