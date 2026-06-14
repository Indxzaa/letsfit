import type { Progress } from './progress';
import { levelFromXp } from './progress';

export type EarnedTitle = {
  id: string;
  value: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  check: (p: Progress) => boolean;
  getProgress?: (p: Progress) => { current: number; max: number };
};

export const EARNED_TITLES: EarnedTitle[] = [
  { id: 'title-beginner',        value: 'Beginner',           description: 'Complete your first session.',  rarity: 'common',    check: (p) => p.totalSessions >= 1,                                              getProgress: (p) => ({ current: Math.min(1, p.totalSessions), max: 1 }) },
  { id: 'title-rookie-athlete',  value: 'Rookie Athlete',     description: 'Reach level 10.',               rarity: 'common',    check: (p) => levelFromXp(p.xp) >= 10,                                           getProgress: (p) => ({ current: Math.min(10, levelFromXp(p.xp)), max: 10 }) },
  { id: 'title-dedicated-mover', value: 'Dedicated Mover',    description: 'Reach level 25.',               rarity: 'rare',      check: (p) => levelFromXp(p.xp) >= 25,                                           getProgress: (p) => ({ current: Math.min(25, levelFromXp(p.xp)), max: 25 }) },
  { id: 'title-elite-athlete',   value: 'Elite Athlete',      description: 'Reach level 50.',               rarity: 'epic',      check: (p) => levelFromXp(p.xp) >= 50,                                           getProgress: (p) => ({ current: Math.min(50, levelFromXp(p.xp)), max: 50 }) },
  { id: 'title-fitness-warrior', value: 'Fitness Warrior',    description: 'Reach level 75.',               rarity: 'legendary', check: (p) => levelFromXp(p.xp) >= 75,                                           getProgress: (p) => ({ current: Math.min(75, levelFromXp(p.xp)), max: 75 }) },
  { id: 'title-legend',          value: 'Legend',             description: 'Reach level 100.',              rarity: 'mythic',    check: (p) => levelFromXp(p.xp) >= 100,                                          getProgress: (p) => ({ current: Math.min(100, levelFromXp(p.xp)), max: 100 }) },
  { id: 'title-consistency',     value: 'Consistency Master', description: 'Reach a 30-day streak.',        rarity: 'epic',      check: (p) => Math.max(p.currentStreak, p.longestStreak) >= 30,                  getProgress: (p) => ({ current: Math.min(30, Math.max(p.currentStreak, p.longestStreak)), max: 30 }) },
  { id: 'title-centurion',       value: 'Centurion',          description: 'Complete 1000 total reps.',     rarity: 'legendary', check: (p) => p.totalReps >= 1000,                                               getProgress: (p) => ({ current: Math.min(1000, p.totalReps), max: 1000 }) },
  { id: 'title-boss-slayer',     value: 'Boss Slayer',        description: 'Defeat all 4 bosses.',          rarity: 'legendary', check: (p) => (p.bossesDefeated?.length ?? 0) >= 4,                              getProgress: (p) => ({ current: Math.min(4, p.bossesDefeated?.length ?? 0), max: 4 }) },
];

export function getTitle(id: string): EarnedTitle | undefined {
  return EARNED_TITLES.find((t) => t.id === id);
}
