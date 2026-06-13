import type { LucideIcon } from 'lucide-react';
import { Dumbbell, ArrowUp, Sparkles, Activity, Hand, Zap, Move, Wind } from 'lucide-react';

export type Exercise = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  hasAiDetection: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  equipment: string;
  targets: number[];
  defaultTarget: number;
  isTimed?: boolean;
  world: 1 | 2 | 3 | 4;
};

export const WORLD_CONFIG: Record<number, { name: string; tagline: string; unlockLabel: string; isUnlocked: (totalReps: number, level: number) => boolean }> = {
  1: { name: 'Foundation',  tagline: 'Build the base',         unlockLabel: 'Always available',   isUnlocked: () => true },
  2: { name: 'Core',        tagline: 'Stability & endurance',  unlockLabel: 'Complete 50 reps',   isUnlocked: (r) => r >= 50 },
  3: { name: 'Strength',    tagline: 'Power & resilience',     unlockLabel: 'Reach level 5',      isUnlocked: (_, l) => l >= 5 },
  4: { name: 'Endurance',   tagline: 'Push further',           unlockLabel: 'Reach level 10',     isUnlocked: (_, l) => l >= 10 },
};

export const EXERCISES: Exercise[] = [
  // World 1 — Foundation
  { slug: 'squat',          name: 'Squat',          tagline: 'Lower body strength',    description: 'Real-time form detection with rep counting and posture feedback.',   icon: Dumbbell,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '5–15 min', equipment: 'None',        targets: [10, 20, 50],    defaultTarget: 20, world: 1 },
  { slug: 'pushup',         name: 'Push-up',         tagline: 'Upper body & core',      description: 'Build chest, shoulder, and core strength with controlled push-ups.', icon: ArrowUp,   available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 20, world: 1 },
  { slug: 'jumping-jack',   name: 'Jumping Jack',    tagline: 'Cardio & warm-up',       description: 'A simple full-body cardio movement to warm up or stay active.',      icon: Sparkles,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [20, 50, 100],   defaultTarget: 50, world: 1 },

  // World 2 — Core
  { slug: 'plank',          name: 'Plank',           tagline: 'Core stability',          description: 'A timed isometric hold to build core endurance and posture.',         icon: Activity,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '1–3 min',  equipment: 'None',        targets: [30, 60, 120],   defaultTarget: 60, isTimed: true, world: 2 },
  { slug: 'mountain-climber', name: 'Mountain Climber', tagline: 'Core & cardio',        description: 'Explosive full-body movement that trains core strength and cardio endurance.', icon: Zap, available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '5–10 min', equipment: 'None',        targets: [20, 40, 60],    defaultTarget: 20, world: 2 },
  { slug: 'dead-bug',       name: 'Dead Bug',         tagline: 'Core control',           description: 'A slow, deliberate core drill that trains spinal stability and coordination.', icon: Move, available: true, hasAiDetection: false, difficulty: 'Beginner',    duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 10, world: 2 },

  // World 3 — Strength
  { slug: 'pullup',         name: 'Pull-up',          tagline: 'Back & arms',            description: 'A challenging compound movement for back, biceps, and grip strength.', icon: Hand,      available: true, hasAiDetection: true,  difficulty: 'Advanced',     duration: '5–10 min', equipment: 'Pull-up bar', targets: [5, 10, 15],     defaultTarget: 10, world: 3 },
  { slug: 'lunge',          name: 'Lunge',            tagline: 'Legs & balance',         description: 'Unilateral leg strength for balance, hip stability, and quad power.',  icon: Dumbbell,  available: true, hasAiDetection: false, difficulty: 'Beginner',     duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 20, world: 3 },
  { slug: 'glute-bridge',   name: 'Glute Bridge',     tagline: 'Posterior chain',        description: 'Activates glutes, hamstrings, and lower back — essential for posture and power.', icon: ArrowUp, available: true, hasAiDetection: false, difficulty: 'Beginner', duration: '5–10 min', equipment: 'None', targets: [15, 25, 40], defaultTarget: 15, world: 3 },

  // World 4 — Endurance
  { slug: 'wall-sit',       name: 'Wall Sit',         tagline: 'Quad endurance',         description: 'A static lower-body hold that builds quad endurance and mental toughness.', icon: Activity, available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '2–5 min', equipment: 'Wall', targets: [30, 60, 90], defaultTarget: 30, isTimed: true, world: 4 },
  { slug: 'high-knees',     name: 'High Knees',       tagline: 'Cardio & hip flexors',   description: 'High-intensity cardio drill for hip flexor strength and coordination.',  icon: Wind,      available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '3–8 min',  equipment: 'None',        targets: [20, 40, 80],    defaultTarget: 40, world: 4 },
  { slug: 'bird-dog',       name: 'Bird Dog',         tagline: 'Balance & core',         description: 'A stability drill that trains spinal alignment, balance, and core control.', icon: Move, available: true, hasAiDetection: false, difficulty: 'Beginner',    duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 10, world: 4 },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
