import type { LucideIcon } from 'lucide-react';
import { Dumbbell, ArrowUp, Sparkles, Activity, Hand } from 'lucide-react';

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
};

export const EXERCISES: Exercise[] = [
  {
    slug: 'squat',
    name: 'Squat',
    tagline: 'Lower body strength',
    description: 'Real-time form detection with rep counting and posture feedback.',
    icon: Dumbbell,
    available: true,
    hasAiDetection: true,
    difficulty: 'Beginner',
    duration: '5–15 min',
    equipment: 'None',
    targets: [10, 20, 50],
    defaultTarget: 20,
  },
  {
    slug: 'pushup',
    name: 'Push-up',
    tagline: 'Upper body & core',
    description: 'Build chest, shoulder, and core strength with controlled push-ups.',
    icon: ArrowUp,
    available: true,
    hasAiDetection: true,
    difficulty: 'Beginner',
    duration: '5–10 min',
    equipment: 'None',
    targets: [10, 20, 30],
    defaultTarget: 20,
  },
  {
    slug: 'pullup',
    name: 'Pull-up',
    tagline: 'Back & arms',
    description: 'A challenging compound movement for back, biceps, and grip strength.',
    icon: Hand,
    available: true,
    hasAiDetection: true,
    difficulty: 'Advanced',
    duration: '5–10 min',
    equipment: 'Pull-up bar',
    targets: [5, 10, 15],
    defaultTarget: 10,
  },
  {
    slug: 'jumping-jack',
    name: 'Jumping Jack',
    tagline: 'Cardio & warm-up',
    description: 'A simple full-body cardio movement to warm up or stay active.',
    icon: Sparkles,
    available: true,
    hasAiDetection: true,
    difficulty: 'Beginner',
    duration: '3–5 min',
    equipment: 'None',
    targets: [20, 50, 100],
    defaultTarget: 50,
  },
  {
    slug: 'plank',
    name: 'Plank',
    tagline: 'Core stability',
    description: 'A timed isometric hold to build core endurance and posture.',
    icon: Activity,
    available: true,
    hasAiDetection: true,
    difficulty: 'Beginner',
    duration: '1–3 min',
    equipment: 'None',
    targets: [30, 60, 120],
    defaultTarget: 60,
    isTimed: true,
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
