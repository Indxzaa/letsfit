import type { Progress } from './progress';

export type Stage = {
  id: string;
  world: number;
  index: number;
  type: 'exercise' | 'boss';
  slug?: string;
  bossId?: string;
  reps: number;
  name: string;
};

export const STAGES: Stage[] = [
  // World 1 – Forest Realm
  { id: 'w1s1', world: 1, index: 1, type: 'exercise', slug: 'jumping-jack',    reps: 20, name: 'Training Ground' },
  { id: 'w1s2', world: 1, index: 2, type: 'exercise', slug: 'squat',           reps: 15, name: 'Forest Path' },
  { id: 'w1s3', world: 1, index: 3, type: 'exercise', slug: 'pushup',          reps: 12, name: 'Ancient Shrine' },
  { id: 'w1s4', world: 1, index: 4, type: 'exercise', slug: 'lunge',           reps: 12, name: 'Elite Guardian' },
  { id: 'w1s5', world: 1, index: 5, type: 'boss',     bossId: 'boss-warm-up-king', reps: 0, name: 'Forest Boss' },
  // World 2 – Winter Kingdom
  { id: 'w2s1', world: 2, index: 1, type: 'exercise', slug: 'jumping-jack',    reps: 30, name: 'Snow Trail' },
  { id: 'w2s2', world: 2, index: 2, type: 'exercise', slug: 'plank',           reps: 30, name: 'Ice Cave' },
  { id: 'w2s3', world: 2, index: 3, type: 'exercise', slug: 'squat',           reps: 20, name: 'Blizzard Challenge' },
  { id: 'w2s4', world: 2, index: 4, type: 'exercise', slug: 'mountain-climber', reps: 20, name: 'Ice Champion' },
  { id: 'w2s5', world: 2, index: 5, type: 'boss',     bossId: 'boss-the-grinder', reps: 0, name: 'Winter Boss' },
  // World 3 – Witch Coven
  { id: 'w3s1', world: 3, index: 1, type: 'exercise', slug: 'lunge',           reps: 15, name: 'Haunted Woods' },
  { id: 'w3s2', world: 3, index: 2, type: 'exercise', slug: 'squat',           reps: 25, name: 'Rune Circle' },
  { id: 'w3s3', world: 3, index: 3, type: 'exercise', slug: 'pushup',          reps: 20, name: 'Cursed Library' },
  { id: 'w3s4', world: 3, index: 4, type: 'exercise', slug: 'mountain-climber', reps: 25, name: 'Coven Guardian' },
  { id: 'w3s5', world: 3, index: 5, type: 'boss',     bossId: 'boss-iron-wall', reps: 0, name: 'Witch Queen' },
  // World 4 – Elven Sanctuary
  { id: 'w4s1', world: 4, index: 1, type: 'exercise', slug: 'high-knees',     reps: 40, name: 'Sacred Path' },
  { id: 'w4s2', world: 4, index: 2, type: 'exercise', slug: 'squat',          reps: 30, name: 'Ancient Temple' },
  { id: 'w4s3', world: 4, index: 3, type: 'exercise', slug: 'pushup',         reps: 25, name: 'Crystal Grove' },
  { id: 'w4s4', world: 4, index: 4, type: 'exercise', slug: 'wall-sit',       reps: 60, name: 'Elven Champion' },
  { id: 'w4s5', world: 4, index: 5, type: 'boss',     bossId: 'boss-apex',   reps: 0,  name: 'Elven Guardian' },
];

export function getWorldStages(world: number): Stage[] {
  return STAGES.filter(s => s.world === world);
}

export function isStageComplete(stage: Stage, progress: Progress): boolean {
  if (stage.type === 'boss') return progress.bossesDefeated.includes(stage.bossId!);
  return progress.stagesCompleted.includes(stage.id);
}

export function isStageUnlocked(stage: Stage, progress: Progress): boolean {
  if (stage.world === 1 && stage.index === 1) return true;
  if (stage.index > 1) {
    const prev = STAGES.find(s => s.world === stage.world && s.index === stage.index - 1);
    if (!prev || !isStageComplete(prev, progress)) return false;
  }
  if (stage.world > 1 && stage.index === 1) {
    const prevBoss = STAGES.find(s => s.world === stage.world - 1 && s.index === 5);
    if (!prevBoss || !isStageComplete(prevBoss, progress)) return false;
  }
  return true;
}
