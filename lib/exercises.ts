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
  howToPerform?: string[];
  commonMistakes?: string[];
  infoImage?: string;
};

export const WORLD_CONFIG: Record<number, { name: string; tagline: string; unlockLabel: string; isUnlocked: (totalReps: number, level: number) => boolean }> = {
  1: { name: 'Forest Realm',    tagline: 'The Beginning of the Journey',  unlockLabel: 'Always available',   isUnlocked: () => true },
  2: { name: 'Winter Kingdom',  tagline: 'Where Only the Strong Endure',  unlockLabel: 'Complete 50 reps',   isUnlocked: (r) => r >= 50 },
  3: { name: 'Witch Coven',     tagline: 'Realm of Ancient Magic',         unlockLabel: 'Reach level 5',      isUnlocked: (_, l) => l >= 5 },
  4: { name: 'Elven Sanctuary', tagline: 'The Final Sacred Challenge',     unlockLabel: 'Reach level 10',     isUnlocked: (_, l) => l >= 10 },
};

export const EXERCISES: Exercise[] = [
  // World 1 — Foundation
  {
    slug: 'squat', name: 'Squat', tagline: 'Lower body strength',
    description: 'Strengthens your legs and core by targeting your quadriceps, hamstrings, glutes, and calves.',
    icon: Dumbbell, available: true, hasAiDetection: true, difficulty: 'Beginner', duration: '5–15 min', equipment: 'None',
    targets: [10, 20, 50], defaultTarget: 20, world: 1, category: 'Lower Body', tags: ['legs', 'glutes', 'strength'],
    howToPerform: [
      'Stand with feet shoulder-width apart.',
      'Lower your hips as if sitting in a chair.',
      'Keep your chest up and back neutral.',
      'Lower until thighs are parallel to the floor.',
      'Push through your heels to stand back up.',
    ],
    commonMistakes: [
      'Knees moving too far forward.',
      'Rounding your back.',
      'Not squatting deep enough.',
      'Leaning too far forward.',
    ],
    infoImage: '/squats.png',
  },
  { slug: 'pushup',         name: 'Push-up',         tagline: 'Upper body & core',      description: 'Build chest, shoulder, and core strength with controlled push-ups.', icon: ArrowUp,   available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 20, world: 1, category: 'Upper Body',      tags: ['chest', 'arms', 'strength'],
    howToPerform: [
      'Start in a high plank position with your hands slightly wider than shoulder-width apart.',
      'Keep your body in a straight line from your head to your heels.',
      'Lower your chest by bending your elbows until it is close to the floor.',
      'Push through your palms to straighten your arms and return to the starting position.',
      'Repeat while maintaining proper body alignment.',
    ],
    commonMistakes: [
      'Letting your hips sag toward the floor.',
      'Raising your hips too high.',
      'Flaring your elbows too far outward.',
      'Not lowering your chest enough.',
      'Looking down excessively instead of keeping your neck neutral.',
    ],
    infoImage: '/pushup.png',
  },
  { slug: 'jumping-jack',   name: 'Jumping Jack',    tagline: 'Cardio & warm-up',       description: 'A simple full-body cardio movement to warm up or stay active.',      icon: Sparkles,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [20, 50, 100],   defaultTarget: 50, world: 1, category: 'Cardio',          tags: ['warm-up', 'full-body', 'cardio'],
    howToPerform: [
      'Stand upright with your feet together and your arms at your sides.',
      'Jump while spreading your feet wider than shoulder-width apart.',
      'Raise your arms overhead until your hands nearly touch.',
      'Jump again to bring your feet back together while lowering your arms to your sides.',
      'Continue with a smooth and controlled rhythm.',
    ],
    commonMistakes: [
      'Not raising your arms fully overhead.',
      'Taking steps instead of jumping.',
      'Landing heavily without bending your knees slightly.',
      'Moving your arms and legs out of sync.',
      'Leaning your body excessively during the movement.',
    ],
    infoImage: '/jumping jack.png',
  },
  { slug: 'march-in-place', name: 'March in Place',  tagline: 'Cardio warm-up',         description: 'Low-impact cardio — lift your knees in a steady marching rhythm.',    icon: Wind,      available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [20, 40, 80],    defaultTarget: 40, world: 1, category: 'Cardio',          tags: ['cardio', 'warm-up', 'low-impact'],
    howToPerform: [
      'Stand upright with your feet hip-width apart.',
      'Lift one knee to about hip height while swinging the opposite arm naturally.',
      'Lower your foot gently back to the ground.',
      'Alternate legs in a steady, controlled rhythm.',
      'Keep your chest up and core engaged throughout the movement.',
    ],
    commonMistakes: [
      'Lifting the knees too low.',
      'Leaning backward while raising the knees.',
      'Looking down instead of forward.',
      'Stomping your feet heavily.',
      'Moving too fast and losing control.',
    ],
    infoImage: '/march in place.png',
  },
  { slug: 'heel-raises',    name: 'Heel Raises',     tagline: 'Calf strength',          description: 'Rise onto your toes to build calf strength and ankle stability.',     icon: Dumbbell,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '3–5 min',  equipment: 'None',        targets: [15, 25, 40],    defaultTarget: 25, world: 1, category: 'Lower Body',      tags: ['calves', 'ankles', 'strength'],
    howToPerform: [
      'Stand with your feet shoulder-width apart.',
      'Keep your knees slightly bent and your body upright.',
      'Push through the balls of your feet to raise your heels as high as possible.',
      'Pause briefly at the top of the movement.',
      'Slowly lower your heels back to the floor and repeat.',
    ],
    commonMistakes: [
      'Bouncing instead of moving with control.',
      'Leaning your body forward.',
      'Rolling your ankles inward or outward.',
      'Not lifting the heels fully.',
      'Dropping the heels too quickly.',
    ],
    infoImage: '/heel raises.png',
  },
  { slug: 'arm-circles',    name: 'Arm Circles',     tagline: 'Shoulder warm-up',       description: 'Rotate your arms in wide circles to warm up and mobilize the shoulders.', icon: Sparkles, available: true, hasAiDetection: true,  difficulty: 'Beginner',  duration: '1–3 min',  equipment: 'None',        targets: [30, 60, 90],    defaultTarget: 60, world: 1, category: 'Upper Body',      tags: ['shoulders', 'mobility', 'warm-up'], isTimed: true,
    howToPerform: [
      'Stand with your feet shoulder-width apart.',
      'Extend both arms straight out to your sides at shoulder height.',
      'Keep your elbows straight and shoulders relaxed.',
      'Make slow, controlled circles with your arms using your shoulders.',
      'Maintain a steady rhythm while keeping your core engaged.',
    ],
    commonMistakes: [
      'Bending the elbows too much.',
      'Making circles that are too small.',
      'Moving too quickly.',
      'Shrugging the shoulders.',
      'Swinging the entire body instead of rotating the arms.',
    ],
    infoImage: '/arm circle.png',
  },

  // World 2 — Core
  { slug: 'plank',          name: 'Plank',           tagline: 'Core stability',          description: 'A timed isometric hold to build core endurance and posture.',         icon: Activity,  available: true, hasAiDetection: true,  difficulty: 'Beginner',     duration: '1–3 min',  equipment: 'None',        targets: [30, 60, 120],   defaultTarget: 60, isTimed: true, world: 2, category: 'Core / Stability', tags: ['core', 'isometric', 'endurance'],
    howToPerform: [
      'Start on your forearms with your elbows directly under your shoulders.',
      'Extend your legs behind you with your toes on the floor.',
      'Keep your body in a straight line from your head to your heels.',
      'Tighten your core and glutes while breathing normally.',
      'Hold the position without letting your hips rise or sag.',
    ],
    commonMistakes: [
      'Letting your hips sag toward the floor.',
      'Raising your hips too high.',
      'Holding your breath.',
      'Looking too far forward or down.',
      'Allowing your shoulders to shrug.',
    ],
    infoImage: '/plank.png',
  },
  { slug: 'mountain-climber', name: 'Mountain Climber', tagline: 'Core & cardio',       description: 'Explosive full-body movement that trains core strength and cardio endurance.', icon: Zap, available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '5–10 min', equipment: 'None',        targets: [20, 40, 60],    defaultTarget: 20, world: 2, category: 'Core / Stability', tags: ['core', 'cardio', 'full-body'],
    howToPerform: [
      'Start in a high plank position with your hands directly under your shoulders.',
      'Keep your body in a straight line from your head to your heels.',
      'Drive one knee toward your chest while keeping the opposite leg extended.',
      'Return your foot to the starting position and immediately alternate legs.',
      'Continue alternating with controlled, steady movements while keeping your core engaged.',
    ],
    commonMistakes: [
      'Letting your hips rise too high.',
      'Allowing your hips to sag toward the floor.',
      'Taking short knee drives.',
      'Bouncing your body excessively.',
      'Moving too fast and sacrificing proper form.',
    ],
    infoImage: '/mountain climber.png',
  },
  { slug: 'dead-bug',       name: 'Dead Bug',         tagline: 'Core control',           description: 'A slow, deliberate core drill that trains spinal stability and coordination.', icon: Move, available: true, hasAiDetection: false, difficulty: 'Beginner',   duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 10, world: 2, category: 'Core / Stability', tags: ['core', 'stability', 'lower-back'],
    howToPerform: [
      'Lie on your back with your arms extended toward the ceiling and your knees bent at 90 degrees.',
      'Tighten your core and press your lower back gently into the floor.',
      'Slowly extend your right arm behind your head while extending your left leg toward the floor.',
      'Return to the starting position and repeat with the opposite arm and leg.',
      'Continue alternating sides with slow, controlled movements.',
    ],
    commonMistakes: [
      'Arching your lower back off the floor.',
      'Moving too quickly.',
      'Extending the wrong arm and leg together.',
      'Locking your knees completely.',
      'Holding your breath during the exercise.',
    ],
    infoImage: '/deadbug.png',
  },
  { slug: 'knee-to-elbow',  name: 'Knee to Elbow',   tagline: 'Core rotation',          description: 'Standing crunch — drive your knee to the opposite elbow for oblique activation.', icon: Zap, available: true, hasAiDetection: true,  difficulty: 'Intermediate', duration: '5–10 min', equipment: 'None', targets: [10, 20, 30], defaultTarget: 20, world: 2, category: 'Core / Stability', tags: ['core', 'obliques', 'balance'],
    howToPerform: [
      'Stand with your feet shoulder-width apart and engage your core.',
      'Lift one knee toward your chest.',
      'Rotate your torso and bring the opposite elbow toward the raised knee.',
      'Return to the starting position with control.',
      'Alternate sides while maintaining a steady rhythm.',
    ],
    commonMistakes: [
      'Barely lifting the knee.',
      'Not rotating the torso.',
      'Moving too quickly and losing balance.',
      'Rounding the shoulders excessively.',
      'Using momentum instead of controlled movement.',
    ],
    infoImage: '/elbow to knee.png',
  },
  { slug: 'plank-knee-taps', name: 'Plank Knee Taps', tagline: 'Core & stability',      description: 'From plank, tap each knee to the ground alternately while keeping hips level.', icon: Activity, available: true, hasAiDetection: true, difficulty: 'Advanced', duration: '5–10 min', equipment: 'None', targets: [10, 20, 30], defaultTarget: 20, world: 2, category: 'Core / Stability', tags: ['core', 'stability', 'advanced'],
    howToPerform: [
      'Start in a high plank position with your hands directly under your shoulders.',
      'Keep your body in a straight line and engage your core.',
      'Lower one knee to lightly tap the floor while keeping your upper body stable.',
      'Return the leg to the starting position and repeat with the opposite knee.',
      'Alternate knee taps while maintaining a strong plank posture.',
    ],
    commonMistakes: [
      'Letting your hips sag or rotate.',
      'Raising your hips too high.',
      'Dropping both knees at the same time.',
      'Moving too quickly and losing control.',
      'Failing to keep the core engaged.',
    ],
  },

  // World 3 — Strength
  { slug: 'pullup',         name: 'Pull-up',          tagline: 'Back & arms',            description: 'A challenging compound movement for back, biceps, and grip strength.', icon: Hand,      available: true, hasAiDetection: false, difficulty: 'Advanced',     duration: '5–10 min', equipment: 'Pull-up bar', targets: [5, 10, 15],     defaultTarget: 10, world: 3, category: 'Upper Body',      tags: ['back', 'arms', 'strength'],
    howToPerform: [
      'Grip the pull-up bar slightly wider than shoulder-width with your palms facing away.',
      'Hang with your arms fully extended and shoulders engaged.',
      'Pull yourself upward until your chin reaches or passes the bar.',
      'Lower yourself slowly until your arms are fully extended.',
      'Repeat using smooth, controlled movements.',
    ],
    commonMistakes: [
      'Using excessive swinging or kipping.',
      'Not reaching full arm extension at the bottom.',
      'Pulling only halfway up.',
      'Shrugging the shoulders excessively.',
      'Dropping too quickly instead of lowering with control.',
    ],
  },
  { slug: 'lunge',          name: 'Lunge',            tagline: 'Legs & balance',         description: 'Unilateral leg strength for balance, hip stability, and quad power.',  icon: Dumbbell,  available: true, hasAiDetection: false, difficulty: 'Beginner',     duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 20, world: 3, category: 'Lower Body',      tags: ['legs', 'balance', 'glutes'],
    howToPerform: [
      'Stand upright with your feet hip-width apart.',
      'Step forward with one leg.',
      'Lower your body until both knees are bent at about 90 degrees.',
      'Push through your front heel to return to the starting position.',
      'Alternate legs while maintaining an upright posture.',
    ],
    commonMistakes: [
      'Letting the front knee move too far past the toes.',
      'Leaning the torso forward.',
      'Taking steps that are too short or too long.',
      'Not lowering enough to achieve proper depth.',
      'Pushing off with the back foot instead of the front heel.',
    ],
    infoImage: '/lunge.png',
  },
  { slug: 'glute-bridge',   name: 'Glute Bridge',     tagline: 'Posterior chain',        description: 'Activates glutes, hamstrings, and lower back — essential for posture and power.', icon: ArrowUp, available: true, hasAiDetection: false, difficulty: 'Beginner', duration: '5–10 min', equipment: 'None', targets: [15, 25, 40], defaultTarget: 15, world: 3, category: 'Lower Body', tags: ['glutes', 'hamstrings', 'posterior'],
    howToPerform: [
      'Lie on your back with your knees bent and feet flat on the floor.',
      'Place your arms at your sides with your palms facing down.',
      'Tighten your core and glutes.',
      'Push through your heels to lift your hips until your body forms a straight line from your shoulders to your knees.',
      'Lower your hips slowly back to the floor and repeat.',
    ],
    commonMistakes: [
      'Arching the lower back excessively.',
      'Pushing through the toes instead of the heels.',
      'Not lifting the hips high enough.',
      'Allowing the knees to collapse inward.',
      'Lowering too quickly without control.',
    ],
    infoImage: '/glute bridges.png',
  },
  { slug: 'slow-burpee',    name: 'Slow Burpee',      tagline: 'Full-body strength',     description: 'A controlled no-jump burpee — squat, plank, push-up, and stand.',    icon: Zap,       available: true, hasAiDetection: true,  difficulty: 'Advanced',     duration: '5–10 min', equipment: 'None',        targets: [5, 10, 20],     defaultTarget: 10, world: 3, category: 'Cardio',          tags: ['full-body', 'strength', 'endurance'],
    howToPerform: [
      'Stand with your feet shoulder-width apart.',
      'Squat down and place your hands on the floor.',
      'Step your feet back one at a time into a plank position.',
      'Step your feet back toward your hands and stand up with control.',
      'Repeat the movement at a slow, steady pace.',
    ],
    commonMistakes: [
      'Rushing through the movement.',
      'Letting the hips sag during the plank.',
      'Rounding the back while bending down.',
      'Not fully standing up before starting the next repetition.',
      'Holding your breath throughout the exercise.',
    ],
  },

  // World 4 — Endurance
  { slug: 'wall-sit',       name: 'Wall Sit',         tagline: 'Quad endurance',         description: 'A static lower-body hold that builds quad endurance and mental toughness.', icon: Activity, available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '2–5 min', equipment: 'Wall', targets: [30, 60, 90], defaultTarget: 30, isTimed: true, world: 4, category: 'Lower Body', tags: ['quads', 'endurance', 'isometric'],
    howToPerform: [
      'Stand with your back against a wall and your feet shoulder-width apart.',
      'Slide down the wall until your thighs are parallel to the floor with your knees at 90 degrees.',
      'Keep your back flat against the wall and your feet flat on the floor.',
      'Hold the position while breathing normally and keeping your core engaged.',
      'Push through your heels to slide back up the wall when finished.',
    ],
    commonMistakes: [
      'Letting your knees extend past your toes.',
      'Not sitting low enough to reach 90 degrees.',
      'Arching your lower back away from the wall.',
      'Holding your breath during the hold.',
      'Letting your knees collapse inward.',
    ],
  },
  { slug: 'high-knees',     name: 'High Knees',       tagline: 'Cardio & hip flexors',   description: 'High-intensity cardio drill for hip flexor strength and coordination.',  icon: Wind,      available: true, hasAiDetection: false, difficulty: 'Intermediate', duration: '3–8 min',  equipment: 'None',        targets: [20, 40, 80],    defaultTarget: 40, world: 4, category: 'Cardio',          tags: ['cardio', 'hip-flexors', 'coordination'],
    howToPerform: [
      'Stand upright with your feet hip-width apart.',
      'Drive one knee up toward your chest as high as possible.',
      'Quickly switch legs and drive the opposite knee up.',
      'Pump your arms naturally in rhythm with your legs.',
      'Maintain a fast, controlled pace while staying on the balls of your feet.',
    ],
    commonMistakes: [
      'Not lifting the knees high enough.',
      'Leaning backward excessively.',
      'Landing heavily on your heels.',
      'Moving too slowly and losing intensity.',
      'Letting your arms hang limply instead of pumping.',
    ],
  },
  { slug: 'bird-dog',       name: 'Bird Dog',         tagline: 'Balance & core',         description: 'A stability drill that trains spinal alignment, balance, and core control.', icon: Move, available: true, hasAiDetection: false, difficulty: 'Beginner',    duration: '5–10 min', equipment: 'None',        targets: [10, 20, 30],    defaultTarget: 10, world: 4, category: 'Core / Stability', tags: ['balance', 'stability', 'core'],
    howToPerform: [
      'Start on your hands and knees with your wrists under your shoulders and knees under your hips.',
      'Engage your core and keep your back flat.',
      'Extend your right arm forward and your left leg backward until both are straight.',
      'Hold briefly, then return to the starting position.',
      'Repeat with the opposite arm and leg, alternating sides.',
    ],
    commonMistakes: [
      'Arching or rounding your back.',
      'Rotating your hips or shoulders.',
      'Not extending the arm and leg fully.',
      'Moving too quickly without control.',
      'Letting your supporting elbow or knee collapse.',
    ],
  },
  { slug: 'shadow-boxing',  name: 'Shadow Boxing',    tagline: 'Cardio & coordination',  description: 'Controlled punches and footwork — build cardio, coordination, and upper-body endurance.', icon: Sparkles, available: true, hasAiDetection: true, difficulty: 'Intermediate', duration: '3–8 min', equipment: 'None', targets: [30, 60, 120], defaultTarget: 60, world: 4, category: 'Cardio', tags: ['cardio', 'coordination', 'upper-body'], isTimed: true,
    howToPerform: [
      'Stand with your feet shoulder-width apart and knees slightly bent.',
      'Keep your hands up near your face in a guard position.',
      'Throw punches by extending your arm fully and rotating your torso.',
      'Pull your fist back to the guard position after each punch.',
      'Move your feet lightly and stay on the balls of your feet.',
    ],
    commonMistakes: [
      'Dropping your hands too low.',
      'Punching without rotating your torso.',
      'Locking your elbow at full extension.',
      'Standing flat-footed instead of staying light.',
      'Holding your breath while punching.',
    ],
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
