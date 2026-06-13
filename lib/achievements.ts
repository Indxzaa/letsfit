import type { Progress } from './progress';
import { levelFromXp } from './progress';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  check: (p: Progress) => boolean;
  getProgress?: (p: Progress) => { current: number; max: number };
};

export type DailyQuest = {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  metric: 'reps' | 'calories' | 'sessions';
  reward: { xp: number; coins: number };
};

export const ACHIEVEMENTS: Achievement[] = [
  // Reps milestones
  { id: 'first-rep',     name: 'First step',     description: 'Complete your first rep.',       icon: '🌱', rarity: 'common',    check: (p) => p.totalReps >= 1,    getProgress: (p) => ({ current: Math.min(1, p.totalReps), max: 1 }) },
  { id: 'ten-reps',      name: 'Getting started', description: 'Complete 10 reps total.',       icon: '✨', rarity: 'common',    check: (p) => p.totalReps >= 10,   getProgress: (p) => ({ current: Math.min(10, p.totalReps), max: 10 }) },
  { id: 'fifty-reps',    name: 'Half century',    description: 'Complete 50 reps total.',       icon: '🎯', rarity: 'rare',      check: (p) => p.totalReps >= 50,   getProgress: (p) => ({ current: Math.min(50, p.totalReps), max: 50 }) },
  { id: 'hundred-reps',  name: 'Triple digits',   description: 'Complete 100 reps total.',      icon: '💯', rarity: 'epic',      check: (p) => p.totalReps >= 100,  getProgress: (p) => ({ current: Math.min(100, p.totalReps), max: 100 }) },
  { id: 'fivehundred-reps', name: 'The Grind',    description: 'Complete 500 reps total.',      icon: '⚙️', rarity: 'epic',      check: (p) => p.totalReps >= 500,  getProgress: (p) => ({ current: Math.min(500, p.totalReps), max: 500 }) },
  { id: 'thousand-reps', name: 'Machine',         description: 'Complete 1000 reps total.',     icon: '🤖', rarity: 'legendary', check: (p) => p.totalReps >= 1000, getProgress: (p) => ({ current: Math.min(1000, p.totalReps), max: 1000 }) },

  // Sessions milestones
  { id: 'first-session', name: 'Showed up',       description: 'Complete your first session.',  icon: '🚀', rarity: 'common',    check: (p) => p.totalSessions >= 1,  getProgress: (p) => ({ current: Math.min(1, p.totalSessions), max: 1 }) },
  { id: 'five-sessions', name: 'Regular',          description: 'Complete 5 sessions.',          icon: '🏅', rarity: 'rare',      check: (p) => p.totalSessions >= 5,  getProgress: (p) => ({ current: Math.min(5, p.totalSessions), max: 5 }) },
  { id: 'ten-sessions',  name: 'Committed',        description: 'Complete 10 sessions.',         icon: '🎖️', rarity: 'rare',      check: (p) => p.totalSessions >= 10, getProgress: (p) => ({ current: Math.min(10, p.totalSessions), max: 10 }) },
  { id: 'twentyfive-sessions', name: 'Dedicated',  description: 'Complete 25 sessions.',         icon: '🏆', rarity: 'epic',      check: (p) => p.totalSessions >= 25, getProgress: (p) => ({ current: Math.min(25, p.totalSessions), max: 25 }) },

  // Streaks
  { id: 'three-day-streak', name: 'Three in a row', description: 'Train three days in a row.', icon: '🔥', rarity: 'rare',      check: (p) => p.currentStreak >= 3 || p.longestStreak >= 3, getProgress: (p) => ({ current: Math.min(3, Math.max(p.currentStreak, p.longestStreak)), max: 3 }) },
  { id: 'week-streak',      name: 'Full week',       description: 'Train seven days in a row.', icon: '📅', rarity: 'epic',      check: (p) => p.currentStreak >= 7 || p.longestStreak >= 7, getProgress: (p) => ({ current: Math.min(7, Math.max(p.currentStreak, p.longestStreak)), max: 7 }) },
  { id: 'twoweek-streak',   name: 'Fortnight',       description: 'Train 14 days in a row.',    icon: '🌟', rarity: 'epic',      check: (p) => p.currentStreak >= 14 || p.longestStreak >= 14, getProgress: (p) => ({ current: Math.min(14, Math.max(p.currentStreak, p.longestStreak)), max: 14 }) },
  { id: 'month-streak',     name: 'Iron Habit',      description: 'Train 30 days in a row.',    icon: '💪', rarity: 'legendary', check: (p) => p.currentStreak >= 30 || p.longestStreak >= 30, getProgress: (p) => ({ current: Math.min(30, Math.max(p.currentStreak, p.longestStreak)), max: 30 }) },

  // Levels
  { id: 'level-five',   name: 'Level 5',    description: 'Reach level 5.',   icon: '⭐', rarity: 'epic',      check: (p) => levelFromXp(p.xp) >= 5,  getProgress: (p) => ({ current: Math.min(5, levelFromXp(p.xp)), max: 5 }) },
  { id: 'level-ten',    name: 'Level 10',   description: 'Reach level 10.',  icon: '🌙', rarity: 'epic',      check: (p) => levelFromXp(p.xp) >= 10, getProgress: (p) => ({ current: Math.min(10, levelFromXp(p.xp)), max: 10 }) },
  { id: 'level-twenty', name: 'Level 20',   description: 'Reach level 20.',  icon: '☀️', rarity: 'legendary', check: (p) => levelFromXp(p.xp) >= 20, getProgress: (p) => ({ current: Math.min(20, levelFromXp(p.xp)), max: 20 }) },

  // Economy
  { id: 'coin-collector', name: 'Coin collector', description: 'Earn 100 FitCoins.',        icon: '🪙', rarity: 'rare',      check: (p) => p.fitCoins >= 100,  getProgress: (p) => ({ current: Math.min(100, p.fitCoins), max: 100 }) },
  { id: 'big-spender',    name: 'Big spender',    description: 'Unlock your first shop item.', icon: '🛍️', rarity: 'legendary', check: (p) => p.unlockedItems.length >= 1 },

  // Boss battles
  { id: 'boss-first',    name: 'First Blood',     description: 'Defeat your first boss.',                  icon: '⚔️', rarity: 'rare',      check: (p) => (p.bossesDefeated?.length ?? 0) >= 1 },
  { id: 'boss-iron',     name: 'Iron Willed',     description: 'Defeat The Iron Wall.',                    icon: '🛡️', rarity: 'epic',      check: (p) => p.bossesDefeated?.includes('boss-iron-wall') ?? false },
  { id: 'boss-apex',     name: 'APEX Cleared',    description: 'Defeat APEX, the ultimate boss.',          icon: '👑', rarity: 'legendary', check: (p) => p.bossesDefeated?.includes('boss-apex') ?? false },
];

export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'quest-20-reps',    name: 'Daily reps',    description: 'Complete 20 total reps today.',   icon: '💪', target: 20, metric: 'reps',     reward: { xp: 50, coins: 25 } },
  { id: 'quest-50-cal',     name: 'Burn it off',   description: 'Burn 50 estimated calories today.',icon: '🔥', target: 50, metric: 'calories', reward: { xp: 50, coins: 25 } },
  { id: 'quest-3-sessions', name: 'Triple threat', description: 'Complete 3 workout sessions.',     icon: '🎯', target: 3,  metric: 'sessions', reward: { xp: 75, coins: 40 } },
];

export function checkAchievements(p: Progress): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(p)).map((a) => a.id);
}

export function checkQuests(p: Progress): string[] {
  return DAILY_QUESTS.filter((q) => {
    const value = p.missions.questProgress?.[q.metric] ?? 0;
    return value >= q.target;
  }).map((q) => q.id);
}

export function getQuestProgress(p: Progress, quest: DailyQuest): number {
  return Math.min(quest.target, p.missions.questProgress?.[quest.metric] ?? 0);
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getQuest(id: string): DailyQuest | undefined {
  return DAILY_QUESTS.find((q) => q.id === id);
}

export const DAILY_MISSIONS = DAILY_QUESTS;
