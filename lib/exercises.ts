import type { LucideIcon } from 'lucide-react';
import { Dumbbell, ArrowUp, Sparkles, Activity, Hand, Zap, Move, Wind } from 'lucide-react';

export type ExerciseCategory = 'Lower Body' | 'Upper Body' | 'Core / Stability' | 'Cardio';

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
  category: ExerciseCategory;
  tags: string[];
};

export const WORLD_CONFIG: Record<number, { name: string; tagline: string; unlockLabel: string; isUnlocked: (totalReps: number, level: number) => boolean }> = {
  1: { name: 'Forest Realm',    tagline: 'The Beginning of the Journey',  unlockLabel: 'Always available',   isUnlocked: () => true },
  2: { name: 'Winter Kingdom',  tagline: 'Where Only the Strong Endure',  unlockLabel: 'Complete 50 reps',   isUnlocked: (r) => r >= 50 },
  3: { name: 'Witch Coven',     tagline: 'Realm of Ancient Magic',         unlockLabel: 'Reach level 5',      isUnlocked: (_, l) => l >= 5 },
  4: { name: 'Elven Sanctuary', tagline: 'The Final Sacred Challenge',     unlockLabel: 'Reach level 10',     isUnlocked: (_, l) => l >= 10 },
};

export const EXERCISES: Exercise[] = [
  // World 1 — Foundation
  { slug: 'squat',          name: 'Squat',          tagline: 'Lower body strength',    description: 'Real-time form detection with rep counting and posture feedback.',   icon: Dumbbell,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '5–15 min', equipment: 'None',        targets: [10, 20, 50],    defaultTarget: 20, world: 1, category: 'Lower Body',      tags: ['legs', 'glutes', 'strength'] },
  { slug: 'pushup',         name: 'Push-up',         tagline: 'Upper body & core',      description: 'Build chest, shoulder, and core strength with controlled push-ups.', icon: ArrowUp,   available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 20, world: 1, category: 'Upper Body',      tags: ['chest', 'arms', 'strength'] },
  { slug: 'jumping-jack',   name: 'Jumping Jack',    tagline: 'Cardio & warm-up',       description: 'A simple full-body cardio movement to warm up or stay active.',      icon: Sparkles,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [20, 50, 100],   defaultTarget: 50, world: 1, category: 'Cardio',          tags: ['warm-up', 'full-body', 'cardio'] },
  { slug: 'march-in-place', name: 'March in Place',  tagline: 'Cardio warm-up',         description: 'Low-impact cardio — lift your knees in a steady marching rhythm.',    icon: Wind,      available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [20, 40, 80],    defaultTarget: 40, world: 1, category: 'Cardio',          tags: ['cardio', 'warm-up', 'low-impact'] },
  { slug: 'heel-raises',    name: 'Heel Raises',     tagline: 'Calf strength',          description: 'Rise onto your toes to build calf strength and ankle stability.',     icon: Dumbbell,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [15, 25, 40],    defaultTarget: 25, world: 1, category: 'Lower Body',      tags: ['calves', 'ankles', 'strength'] },
  { slug: 'arm-circles',    name: 'Arm Circles',     tagline: 'Shoulder warm-up',       description: 'Rotate your arms in wide circles to warm up and mobilize the shoulders.', icon: Sparkles, available: true, hasAiDetection: true,  difficulty: 'Beginner',  duration: '1–3 min',  equipment: 'None',        targets: [30, 60, 90],    defaultTarget: 60, world: 1, category: 'Upper Body',      tags: ['shoulders', 'mobility', 'warm-up'], isTimed: true },

  // World 2 — Core
  { slug: 'plank',          name: 'Plank',           tagline: 'Core stability',          description: 'A timed isometric hold to build core endurance and posture.',         icon: Activity,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '1–3 min',  equipment: 'None',        targets: [30, 60, 120],   defaultTarget: 60, isTimed: true, world: 2, category: 'Core / Stability', tags: ['core', 'isometric', 'endurance'] },
  { slug: 'mountain-climber', name: 'Mountain Climber', tagline: 'Core & cardio',       description: 'Explosive full-body movement that trains core strength and cardio endurance.', icon: Zap, available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '5–10 min', equipment: 'None',        targets: [20, 40, 60],    defaultTarget: 20, world: 2, category: 'Core / Stability', tags: ['core', 'cardio', 'full-body'] },
  { slug: 'dead-bug',       name: 'Dead Bug',         tagline: 'Core control',           description: 'A slow, deliberate core drill that trains spinal stability and coordination.', icon: Move, available: true, hasAiDetection: false, difficulty: 'Beginner',   duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 10, world: 2, category: 'Core / Stability', tags: ['core', 'stability', 'lower-back'] },
  { slug: 'knee-to-elbow',  name: 'Knee to Elbow',   tagline: 'Core rotation',          description: 'Standing crunch — drive your knee to the opposite elbow for oblique activation.', icon: Zap, available: true, hasAiDetection: true,  difficulty: 'Intermediate', duration: '5–10 min', equipment: 'None', targets: [10, 20, 30], defaultTarget: 20, world: 2, category: 'Core / Stability', tags: ['core', 'obliques', 'balance'] },
  { slug: 'plank-knee-taps', name: 'Plank Knee Taps', tagline: 'Core & stability',      description: 'From plank, tap each knee to the ground alternately while keeping hips level.', icon: Activity, available: true, hasAiDetection: true, difficulty: 'Advanced', duration: '5–10 min', equipment: 'None', targets: [10, 20, 30], defaultTarget: 20, world: 2, category: 'Core / Stability', tags: ['core', 'stability', 'advanced'] },

  // World 3 — Strength
  { slug: 'pullup',         name: 'Pull-up',          tagline: 'Back & arms',            description: 'A challenging compound movement for back, biceps, and grip strength.', icon: Hand,      available: true, hasAiDetection: false, difficulty: 'Advanced',     duration: '5–10 min', equipment: 'Pull-up bar', targets: [5, 10, 15],     defaultTarget: 10, world: 3, category: 'Upper Body',      tags: ['back', 'arms', 'strength'] },
  { slug: 'lunge',          name: 'Lunge',            tagline: 'Legs & balance',         description: 'Unilateral leg strength for balance, hip stability, and quad power.',  icon: Dumbbell,  available: true, hasAiDetection: false, difficulty: 'Beginner',     duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 20, world: 3, category: 'Lower Body',      tags: ['legs', 'balance', 'glutes'] },
  { slug: 'glute-bridge',   name: 'Glute Bridge',     tagline: 'Posterior chain',        description: 'Activates glutes, hamstrings, and lower back — essential for posture and power.', icon: ArrowUp, available: true, hasAiDetection: false, difficulty: 'Beginner', duration: '5–10 min', equipment: 'None', targets: [15, 25, 40], defaultTarget: 15, world: 3, category: 'Lower Body', tags: ['glutes', 'hamstrings', 'posterior'] },
  { slug: 'slow-burpee',    name: 'Slow Burpee',      tagline: 'Full-body strength',     description: 'A controlled no-jump burpee — squat, plank, push-up, and stand.',    icon: Zap,       available: true, hasAiDetection: true,  difficulty: 'Advanced',     duration: '5–10 min', equipment: 'None',        targets: [5, 10, 20],     defaultTarget: 10, world: 3, category: 'Cardio',          tags: ['full-body', 'strength', 'endurance'] },

  // World 4 — Endurance
  { slug: 'wall-sit',       name: 'Wall Sit',         tagline: 'Quad endurance',         description: 'A static lower-body hold that builds quad endurance and mental toughness.', icon: Activity, available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '2–5 min', equipment: 'Wall', targets: [30, 60, 90], defaultTarget: 30, isTimed: true, world: 4, category: 'Lower Body', tags: ['quads', 'endurance', 'isometric'] },
  { slug: 'high-knees',     name: 'High Knees',       tagline: 'Cardio & hip flexors',   description: 'High-intensity cardio drill for hip flexor strength and coordination.',  icon: Wind,      available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '3–8 min',  equipment: 'None',        targets: [20, 40, 80],    defaultTarget: 40, world: 4, category: 'Cardio',          tags: ['cardio', 'hip-flexors', 'coordination'] },
  { slug: 'bird-dog',       name: 'Bird Dog',         tagline: 'Balance & core',         description: 'A stability drill that trains spinal alignment, balance, and core control.', icon: Move, available: true, hasAiDetection: false, difficulty: 'Beginner',    duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 10, world: 4, category: 'Core / Stability', tags: ['balance', 'stability', 'core'] },
  { slug: 'shadow-boxing',  name: 'Shadow Boxing',    tagline: 'Cardio & coordination',  description: 'Controlled punches and footwork — build cardio, coordination, and upper-body endurance.', icon: Sparkles, available: true, hasAiDetection: true, difficulty: 'Intermediate', duration: '3–8 min', equipment: 'None', targets: [30, 60, 120], defaultTarget: 60, world: 4, category: 'Cardio', tags: ['cardio', 'coordination', 'upper-body'], isTimed: true },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
